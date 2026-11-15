// src/components/SpaceScene.jsx
// High-Fidelity 3D Space Scene: Clean Texture Mapping for 3D Globe & Flat Map,
// Dual Geographic Tour Markers, and Audio-Reactive Spikes.
import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GEO_TOUR_STOPS } from '../audio/mapping.js'

const COLOR_CYAN = new THREE.Color('#7ff0ff')
const COLOR_PINK = new THREE.Color('#ff5cb0')

const UP_VECTOR = new THREE.Vector3(0, 1, 0)
const TEMP_NORMAL = new THREE.Vector3()

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uP;
  uniform float uA;
  uniform float uIsFlat;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Direct UV sampling ensures the entire map is rendered cleanly on both globe and plane
    vec4 texColor = texture2D(uTexture, vUv);

    // Playhead line
    float dist = abs(vUv.x - uP);
    if (uIsFlat < 0.5) {
      dist = min(dist, 1.0 - dist);
    }

    float lineWidth = 0.0035;
    float isPlayhead = 1.0 - smoothstep(0.0, lineWidth, dist);

    // Heard vs unheard dimming (only active when playing)
    float isHeard = step(vUv.x, uP);
    float dimFactor = mix(1.0, mix(0.40, 1.0, isHeard), uA);

    // Celestial directional lighting on 3D globe (flat map stays 100% unshaded)
    float light = 1.0;
    if (uIsFlat < 0.5) {
      vec3 sunDir = normalize(vec3(1.2, 0.45, 1.1));
      float diff = max(dot(vNormal, sunDir), 0.0);
      light = 0.75 + 0.25 * diff; // 75% ambient for clear map visibility
    }

    vec3 baseColor = texColor.rgb * dimFactor * light;
    baseColor = mix(baseColor, vec3(1.0, 0.36, 0.69), isPlayhead * min(uA + 0.6, 1.0));

    // Delicate Rayleigh limb scattering on 3D Globe
    if (uIsFlat < 0.5) {
      float limb = 1.0 - max(dot(vNormal, vViewDir), 0.0);
      float atmosphere = pow(limb, 3.8);
      baseColor += vec3(0.38, 0.68, 1.0) * atmosphere * 0.45;
    }

    gl_FragColor = vec4(baseColor, uOpacity);
  }
`

export default function SpaceScene({
  textureSource,
  textureRev = 0,
  progress = 0,
  playing = false,
  voices = [],
  isFlat = false,
  isVideo = false,
  activeTourStop = null,
  onToggleFlat = () => {},
  onSeek = null,
}) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const globeRef = useRef(null)
  const planeRef = useRef(null)
  const globeMaterialRef = useRef(null)
  const planeMaterialRef = useRef(null)
  const spikesGroupRef = useRef(null)
  const planeSpikesGroupRef = useRef(null)
  const globeMarkersGroupRef = useRef(null)
  const planeMarkersGroupRef = useRef(null)
  const globeSpikesRef = useRef([])
  const planeSpikesRef = useRef([])
  const textureRef = useRef(null)
  const globeUniformsRef = useRef(null)
  const planeUniformsRef = useRef(null)
  const [webGLError, setWebGLError] = useState(false)

  // Tracking dynamic state in refs for seamless 60fps render loop
  const progressRef = useRef(progress)
  const playingRef = useRef(playing)
  const isFlatRef = useRef(isFlat)
  const isVideoRef = useRef(isVideo)
  const flatLerpRef = useRef(isFlat ? 1.0 : 0.0)
  const activeTourStopRef = useRef(activeTourStop)
  const textureSourceRef = useRef(textureSource)
  const spikeLengthsRef = useRef(new Float32Array(8))

  const dragRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    startX: 0,
    startY: 0,
    dragYaw: 0,
    dragPitch: 0,
  })

  const pointerRef = useRef({ x: 0, y: 0, curX: 0, curY: 0 })
  const onSeekRef = useRef(onSeek)

  // Keep refs up to date
  useEffect(() => { progressRef.current = progress }, [progress])
  useEffect(() => { playingRef.current = playing }, [playing])
  useEffect(() => { isVideoRef.current = isVideo }, [isVideo])
  useEffect(() => { activeTourStopRef.current = activeTourStop }, [activeTourStop])
  useEffect(() => { textureSourceRef.current = textureSource }, [textureSource])
  useEffect(() => { onSeekRef.current = onSeek }, [onSeek])

  // Synchronize voices to spikes
  useEffect(() => {
    if (voices && voices.length === 8) {
      for (let i = 0; i < 8; i++) {
        spikeLengthsRef.current[i] = voices[i]?.gain || 0
      }
    }
  }, [voices])

  // Clean texture application helper
  const applyTexture = useCallback((source) => {
    if (!source) return
    let newTexture = null

    try {
      if (source instanceof HTMLCanvasElement) {
        newTexture = new THREE.CanvasTexture(source)
      } else if (source instanceof HTMLVideoElement) {
        newTexture = new THREE.VideoTexture(source)
      } else if (source instanceof HTMLImageElement) {
        newTexture = new THREE.Texture(source)
      }

      if (newTexture) {
        // Linear filtering with no mipmap generation guarantees crispness & eliminates black textures
        newTexture.minFilter = THREE.LinearFilter
        newTexture.magFilter = THREE.LinearFilter
        newTexture.generateMipmaps = false
        newTexture.wrapS = THREE.RepeatWrapping
        newTexture.wrapT = THREE.ClampToEdgeWrapping
        newTexture.colorSpace = THREE.SRGBColorSpace
        newTexture.needsUpdate = true

        if (rendererRef.current) {
          const maxAniso = rendererRef.current.capabilities.getMaxAnisotropy() || 8
          newTexture.anisotropy = Math.min(16, maxAniso)
        }

        if (globeUniformsRef.current) {
          globeUniformsRef.current.uTexture.value = newTexture
        }
        if (planeUniformsRef.current) {
          planeUniformsRef.current.uTexture.value = newTexture
        }

        if (globeMaterialRef.current) globeMaterialRef.current.needsUpdate = true
        if (planeMaterialRef.current) planeMaterialRef.current.needsUpdate = true

        textureRef.current = newTexture
      }
    } catch (err) {
      console.warn('Failed to apply texture to 3D scene:', err)
    }
  }, [])

  // Sync texture changes and revisions (instant 0ms update on track change or image load)
  useEffect(() => {
    applyTexture(textureSource)
    if (textureRef.current) {
      textureRef.current.needsUpdate = true
    }
  }, [textureSource, textureRev, applyTexture])

  // Switch between 3D Globe and Flat Map cleanly with smooth interpolation
  useEffect(() => {
    isFlatRef.current = isFlat
  }, [isFlat])

  // Mount Three.js Scene ONCE
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.outputColorSpace = THREE.SRGBColorSpace
    } catch (e) {
      console.warn('WebGL initialization failed:', e)
      setWebGLError(true)
      return
    }

    rendererRef.current = renderer
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0.2, 0, prefersReduced ? 3.4 : 3.7)
    cameraRef.current = camera

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x17114a, 1.0)
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    // Starfield
    const starColors = [0xffffff, 0x7ff0ff, 0xff5cb0, 0xc3b8ea]
    function createStars(count, size, spreadZ) {
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      const c = new THREE.Color()

      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 24
        pos[i * 3 + 1] = (Math.random() - 0.5) * 16
        pos[i * 3 + 2] = -Math.random() * spreadZ - 2

        c.set(starColors[Math.floor(Math.random() * starColors.length)])
        col[i * 3] = c.r
        col[i * 3 + 1] = c.g
        col[i * 3 + 2] = c.b
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      const mat = new THREE.PointsMaterial({
        size,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      })
      return new THREE.Points(geo, mat)
    }

    const farStars = createStars(1400, 0.025, 30)
    const nearStars = createStars(260, 0.045, 12)
    scene.add(farStars)
    scene.add(nearStars)

    // Instant Frame 0 Texture: Sample active texture immediately or fallback to dark canvas
    let initialTexture = null
    if (textureSourceRef.current) {
      initialTexture = new THREE.CanvasTexture(textureSourceRef.current)
      initialTexture.minFilter = THREE.LinearFilter
      initialTexture.magFilter = THREE.LinearFilter
      initialTexture.generateMipmaps = false
      initialTexture.colorSpace = THREE.SRGBColorSpace
      initialTexture.needsUpdate = true
    } else {
      const placeholderCanvas = document.createElement('canvas')
      placeholderCanvas.width = 64
      placeholderCanvas.height = 32
      const placeholderCtx = placeholderCanvas.getContext('2d')
      placeholderCtx.fillStyle = '#0f1a30'
      placeholderCtx.fillRect(0, 0, 64, 32)
      initialTexture = new THREE.CanvasTexture(placeholderCanvas)
      initialTexture.minFilter = THREE.LinearFilter
      initialTexture.magFilter = THREE.LinearFilter
      initialTexture.generateMipmaps = false
      initialTexture.colorSpace = THREE.SRGBColorSpace
    }
    textureRef.current = initialTexture

    const globeUniforms = {
      uTexture: { value: initialTexture },
      uP: { value: 0.0 },
      uA: { value: 0.0 },
      uIsFlat: { value: 0.0 },
      uOpacity: { value: isFlatRef.current ? 0.0 : 1.0 },
    }
    globeUniformsRef.current = globeUniforms

    const planeUniforms = {
      uTexture: { value: initialTexture },
      uP: { value: 0.0 },
      uA: { value: 0.0 },
      uIsFlat: { value: 1.0 },
      uOpacity: { value: isFlatRef.current ? 1.0 : 0.0 },
    }
    planeUniformsRef.current = planeUniforms

    const globeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: globeUniforms,
      transparent: true,
      depthWrite: true,
    })
    globeMaterialRef.current = globeMaterial

    // 3D Globe Mesh (128x96 high-resolution sphere)
    const globeGeo = new THREE.SphereGeometry(1, 128, 96)
    const globe = new THREE.Mesh(globeGeo, globeMaterial)
    globe.position.set(0.55, 0, 0)
    globe.visible = !isFlatRef.current
    scene.add(globe)
    globeRef.current = globe

    // Flat Map Plane Mesh (3.6 x 1.8 2:1 equirectangular ratio)
    const planeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: planeUniforms,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false, // Prevents Z-buffer occlusion and Z-fighting during transitions
    })
    planeMaterialRef.current = planeMaterial

    const planeGeo = new THREE.PlaneGeometry(3.6, 1.8)
    const plane = new THREE.Mesh(planeGeo, planeMaterial)
    plane.position.set(0.35, 0, 0.02) // Slight offset in Z avoids co-planar intersections
    plane.visible = isFlatRef.current
    scene.add(plane)
    planeRef.current = plane

    // Globe Spikes
    const spikesGroup = new THREE.Group()
    spikesGroup.position.copy(globe.position)
    spikesGroup.visible = !isFlatRef.current
    scene.add(spikesGroup)
    spikesGroupRef.current = spikesGroup

    const spikeCylGeo = new THREE.CylinderGeometry(0.012, 0.012, 1, 16)
    spikeCylGeo.translate(0, 0.5, 0)
    const spikeMat = new THREE.MeshBasicMaterial({ color: COLOR_CYAN })

    const globeSpikes = []
    const latitudes = [72, 51, 31, 11, -11, -31, -51, -72]
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(spikeCylGeo, spikeMat)
      mesh.scale.set(1, 0.001, 1)
      spikesGroup.add(mesh)
      globeSpikes.push({ mesh, lat: latitudes[i] })
    }
    globeSpikesRef.current = globeSpikes

    // Flat Map Spikes
    const planeSpikesGroup = new THREE.Group()
    planeSpikesGroup.position.set(0.35, 0, 0.01)
    planeSpikesGroup.visible = isFlatRef.current
    scene.add(planeSpikesGroup)
    planeSpikesGroupRef.current = planeSpikesGroup

    const planeSpikes = []
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(spikeCylGeo, spikeMat)
      mesh.scale.set(1, 0.001, 1)
      mesh.rotation.x = Math.PI * 0.5
      planeSpikesGroup.add(mesh)
      planeSpikes.push({ mesh, lat: latitudes[i] })
    }
    planeSpikesRef.current = planeSpikes

    // Globe Markers Group (Tour Stops)
    const globeMarkersGroup = new THREE.Group()
    globe.add(globeMarkersGroup)
    globeMarkersGroupRef.current = globeMarkersGroup

    // Flat Map Markers Group (Tour Stops)
    const planeMarkersGroup = new THREE.Group()
    plane.add(planeMarkersGroup)
    planeMarkersGroupRef.current = planeMarkersGroup

    const markerRingGeo = new THREE.RingGeometry(0.024, 0.038, 28)
    const markerMat = new THREE.MeshBasicMaterial({
      color: COLOR_CYAN,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    })

    GEO_TOUR_STOPS.forEach((stop) => {
      // Globe marker
      const globeMesh = new THREE.Mesh(markerRingGeo, markerMat.clone())
      const phi = (90 - stop.lat) * (Math.PI / 180)
      const theta = (stop.lon + 180) * (Math.PI / 180)
      const r = 1.012
      const gx = -r * Math.sin(phi) * Math.cos(theta)
      const gy = r * Math.cos(phi)
      const gz = r * Math.sin(phi) * Math.sin(theta)
      globeMesh.position.set(gx, gy, gz)
      globeMesh.lookAt(gx * 2, gy * 2, gz * 2)
      globeMesh.userData = { id: stop.id, stop }
      globeMarkersGroup.add(globeMesh)

      // Flat Map marker
      const planeMesh = new THREE.Mesh(markerRingGeo, markerMat.clone())
      const normU = (stop.lon + 180) / 360 - 0.5
      const normV = (stop.lat + 90) / 180 - 0.5
      const px = normU * 3.6
      const py = normV * 1.8
      planeMesh.position.set(px, py, 0.015)
      planeMesh.userData = { id: stop.id, stop }
      planeMarkersGroup.add(planeMesh)
    })

    // If a texture source is already ready at mount, apply immediately
    if (textureSourceRef.current) {
      applyTexture(textureSourceRef.current)
    }

    const bootStart = performance.now()
    const bootDuration = prefersReduced ? 0 : 350

    function handleResize() {
      if (!container || !renderer) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    function handlePointerMove(e) {
      const normX = (e.clientX / window.innerWidth) * 2 - 1
      const normY = -(e.clientY / window.innerHeight) * 2 + 1
      pointerRef.current.x = normX * 0.25
      pointerRef.current.y = normY * 0.18

      if (dragRef.current.isDragging) {
        const dx = e.clientX - dragRef.current.prevX
        const dy = e.clientY - dragRef.current.prevY
        dragRef.current.prevX = e.clientX
        dragRef.current.prevY = e.clientY

        dragRef.current.dragYaw += dx * 0.006
        dragRef.current.dragPitch = Math.max(
          -0.5,
          Math.min(0.7, dragRef.current.dragPitch + dy * 0.004)
        )
      }
    }

    function handlePointerDown(e) {
      if (e.target.tagName === 'CANVAS') {
        dragRef.current.isDragging = true
        dragRef.current.prevX = e.clientX
        dragRef.current.prevY = e.clientY
        dragRef.current.startX = e.clientX
        dragRef.current.startY = e.clientY
      }
    }

    function handlePointerUp(e) {
      const moved = Math.hypot(
        e.clientX - (dragRef.current.startX || e.clientX),
        e.clientY - (dragRef.current.startY || e.clientY)
      )
      dragRef.current.isDragging = false

      // Interactive Click-to-Probe / Audio Seek on both 3D Globe and Flat Map (forgiving threshold for mobile taps)
      if (moved < 16 && onSeekRef.current && (e.target.tagName === 'CANVAS') && container) {
        const rect = container.getBoundingClientRect()
        const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera)

        const targets = []
        if (isFlatRef.current && planeRef.current && planeRef.current.visible) {
          targets.push(planeRef.current)
        } else if (!isFlatRef.current && globeRef.current && globeRef.current.visible) {
          targets.push(globeRef.current)
        }

        const hits = raycaster.intersectObjects(targets)
        if (hits.length > 0 && hits[0].uv) {
          const uvX = Math.max(0.0, Math.min(1.0, hits[0].uv.x))
          onSeekRef.current(uvX)
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
            try {
              navigator.vibrate(20)
            } catch (e) {}
          }
        }
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)

    let animId
    let isHidden = false

    function handleVisibility() {
      isHidden = document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    function animate(now) {
      animId = requestAnimationFrame(animate)
      if (isHidden || !renderer) return

      // Smooth instant camera micro-settle (350ms)
      if (!prefersReduced && camera.position.z > 3.4) {
        const elapsed = now - bootStart
        const t = Math.min(elapsed / bootDuration, 1.0)
        const easeOut = 1 - Math.pow(1 - t, 3)
        camera.position.z = 3.7 - (3.7 - 3.4) * easeOut
      }

      // Parallax star movements
      if (!prefersReduced) {
        pointerRef.current.curX += (pointerRef.current.x - pointerRef.current.curX) * 0.05
        pointerRef.current.curY += (pointerRef.current.y - pointerRef.current.curY) * 0.05
        nearStars.rotation.y = now * 0.00003
        farStars.rotation.y = now * 0.00001
      }

      // Smooth cinematic interpolation between 3D Globe and Flat Map (snaps instantly if reduced motion)
      const targetFlat = isFlatRef.current ? 1.0 : 0.0
      if (prefersReduced) {
        flatLerpRef.current = targetFlat
      } else {
        flatLerpRef.current += (targetFlat - flatLerpRef.current) * 0.16
      }
      const t = flatLerpRef.current

      if (globeUniformsRef.current && planeUniformsRef.current) {
        globeUniformsRef.current.uP.value = progressRef.current
        planeUniformsRef.current.uP.value = progressRef.current

        const curA = playingRef.current
          ? Math.min(globeUniformsRef.current.uA.value + 0.04, 1.0)
          : 0.0
        globeUniformsRef.current.uA.value = curA
        planeUniformsRef.current.uA.value = curA

        globeUniformsRef.current.uOpacity.value = Math.max(0.0, Math.min(1.0, 1.0 - t))
        planeUniformsRef.current.uOpacity.value = Math.max(0.0, Math.min(1.0, t))
      }

      // Dynamic depthWrite ensures flawless cross-fade without geometry slicing
      if (globeMaterialRef.current) {
        globeMaterialRef.current.depthWrite = t < 0.05
      }

      // Smooth scale and visibility control to eliminate Z-fighting
      if (globeRef.current) {
        globeRef.current.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.88, t))
        globeRef.current.visible = t < 0.995
      }
      if (spikesGroupRef.current) {
        spikesGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.88, t))
        spikesGroupRef.current.visible = t < 0.995
      }

      if (planeRef.current) {
        planeRef.current.scale.setScalar(THREE.MathUtils.lerp(0.92, 1.0, t))
        planeRef.current.visible = t > 0.005
      }
      if (planeSpikesGroupRef.current) {
        planeSpikesGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.92, 1.0, t))
        planeSpikesGroupRef.current.visible = t > 0.005
      }

      // Unified camera position and lookAt (Responsive framing for mobile screens)
      if (!prefersReduced) {
        const isMobileScreen = window.innerWidth <= 768
        const globeX = isMobileScreen ? 0.0 : 0.2
        const globeZ = isMobileScreen ? 3.7 : 3.4
        const flatX = isMobileScreen ? 0.0 : 0.35
        const flatZ = isMobileScreen ? 3.25 : 3.05

        const targetCamX = THREE.MathUtils.lerp(globeX + pointerRef.current.curX, flatX, t)
        const targetCamY = pointerRef.current.curY * (1.0 - t * 0.7)
        const targetCamZ = THREE.MathUtils.lerp(globeZ, flatZ, t)
        camera.position.x += (targetCamX - camera.position.x) * 0.12
        camera.position.y += (targetCamY - camera.position.y) * 0.12
        camera.position.z += (targetCamZ - camera.position.z) * 0.12
        camera.lookAt(THREE.MathUtils.lerp(globeX, flatX, t), isMobileScreen ? 0.06 : 0, 0)
      }

      // ONLY re-upload texture if video is actively playing (ELIMINATES FRAME FREEZES)
      if (textureRef.current && playingRef.current && isVideoRef.current) {
        textureRef.current.needsUpdate = true
      }

      // Continuous smooth 60fps globe rotation with shortest angular arc
      if (globeRef.current && t < 0.99) {
        const stop = activeTourStopRef.current
        if (stop) {
          const targetLonRad = (stop.lon * Math.PI) / 180
          const targetYaw = -targetLonRad + Math.PI * 0.5

          let diffYaw = (targetYaw - globeRef.current.rotation.y) % (Math.PI * 2)
          if (diffYaw > Math.PI) diffYaw -= Math.PI * 2
          if (diffYaw < -Math.PI) diffYaw += Math.PI * 2
          globeRef.current.rotation.y += diffYaw * 0.08

          const targetPitch = -stop.lat * (Math.PI / 180) * 0.35
          globeRef.current.rotation.x += (targetPitch - globeRef.current.rotation.x) * 0.08
        } else if (playingRef.current) {
          const targetYaw = Math.PI * 0.5 - Math.PI * 2 * progressRef.current + dragRef.current.dragYaw
          globeRef.current.rotation.y = targetYaw
          globeRef.current.rotation.x = dragRef.current.dragPitch
          dragRef.current.dragYaw *= 0.94
        } else {
          if (!prefersReduced) {
            globeRef.current.rotation.y += 0.001
          }
          globeRef.current.rotation.x = dragRef.current.dragPitch
        }
      }

      // Pulse active tour marker on both Globe and Plane
      const pulse = 1 + Math.sin(now * 0.006) * 0.35
      const curStop = activeTourStopRef.current
      function updateMarkers(group) {
        if (!group) return
        group.children.forEach((m) => {
          if (curStop && m.userData?.id === curStop.id) {
            m.scale.set(pulse * 1.5, pulse * 1.5, 1)
            m.material.color = COLOR_PINK
          } else {
            m.scale.set(1, 1, 1)
            m.material.color = COLOR_CYAN
          }
        })
      }
      updateMarkers(globeMarkersGroupRef.current)
      updateMarkers(planeMarkersGroupRef.current)

      // Update audio spikes
      const gSpikes = globeSpikesRef.current
      const pSpikes = planeSpikesRef.current
      for (let i = 0; i < 8; i++) {
        const targetLen = (spikeLengthsRef.current[i] || 0) * 0.6
        if (gSpikes[i]) {
          const curScale = gSpikes[i].mesh.scale.y
          const nextScale = curScale + (targetLen - curScale) * 0.25
          gSpikes[i].mesh.scale.set(1, Math.max(nextScale, 0.001), 1)

          const latRad = (gSpikes[i].lat * Math.PI) / 180
          const cosLat = Math.cos(latRad)
          const sinLat = Math.sin(latRad)

          const x = cosLat * Math.sin(0)
          const y = sinLat
          const z = cosLat * Math.cos(0)

          gSpikes[i].mesh.position.set(x, y, z)
          TEMP_NORMAL.set(x, y, z).normalize()
          gSpikes[i].mesh.quaternion.setFromUnitVectors(UP_VECTOR, TEMP_NORMAL)
        }

        // Flat map spikes update along playhead
        if (pSpikes[i]) {
          const curScale = pSpikes[i].mesh.scale.y
          const nextScale = curScale + (targetLen - curScale) * 0.25
          pSpikes[i].mesh.scale.set(1, Math.max(nextScale, 0.001), 1)
          const px = (progressRef.current - 0.5) * 3.6
          const py = (latitudes[i] / 90) * 0.85
          pSpikes[i].mesh.position.set(px, py, 0.01)
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      if (renderer) renderer.dispose()
    }
  }, [applyTexture])

  if (webGLError) {
    return (
      <div
        className="space-scene-container fallback"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, #17114a 0%, #0a0624 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 0,
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            background: 'rgba(15, 10, 51, 0.92)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🗺️</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--cyan)', fontSize: '1.1rem' }}>
            3D WebGL Acceleration Unavailable
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--soft)', lineHeight: 1.5 }}>
            Your browser environment does not support WebGL hardware acceleration. Earth Jukebox continues sonifying in 2D mode.
          </p>
        </div>
      </div>
    )
  }

  const handleTurnLeft = () => {
    dragRef.current.dragYaw += 0.45
    if (globeRef.current) globeRef.current.rotation.y += 0.45
  }

  const handleTurnRight = () => {
    dragRef.current.dragYaw -= 0.45
    if (globeRef.current) globeRef.current.rotation.y -= 0.45
  }

  const handleResetOrientation = () => {
    dragRef.current.dragYaw = 0
    dragRef.current.dragPitch = 0
    if (globeRef.current) {
      globeRef.current.rotation.set(0, 0, 0)
    }
  }

  return (
    <>
      <div
        ref={mountRef}
        className="space-scene-container"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'auto',
        }}
      />

      {/* Accessible 3D Globe Keyboard Navigation Controls */}
      {!isFlat && (
        <aside
          className="globe-accessible-nav"
          aria-label="3D Globe keyboard rotation controls"
        >
          <button
            type="button"
            className="globe-rotate-btn"
            onClick={handleTurnLeft}
            aria-label="Turn 3D globe left"
            title="Turn 3D globe left"
          >
            ⟲ Turn Left
          </button>
          <button
            type="button"
            className="globe-rotate-btn"
            onClick={handleTurnRight}
            aria-label="Turn 3D globe right"
            title="Turn 3D globe right"
          >
            ⟳ Turn Right
          </button>
          <button
            type="button"
            className="globe-rotate-btn"
            onClick={handleResetOrientation}
            aria-label="Reset 3D globe orientation"
            title="Reset 3D globe orientation"
          >
            ↺ Reset
          </button>
        </aside>
      )}
    </>
  )
}
