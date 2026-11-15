// src/components/ColourBar.jsx
// Displays only published NASA colour bar images with their official credit
export default function ColourBar({ colorbar, title }) {
  if (!colorbar || !colorbar.file) return null

  return (
    <figure className="colorbar-figure">
      <img
        src={colorbar.file}
        alt={`Official NASA colour scale for ${title}`}
        className="colorbar-img"
      />
      <figcaption className="colorbar-caption">
        Official NASA colour bar: {colorbar.credit || 'NASA Scientific Visualization Studio'}
      </figcaption>
    </figure>
  )
}
