export interface PersonProps {
  photoFilename: string
  firstName: string
  lastName: string
}

export function Person({ photoFilename, firstName, lastName }: PersonProps) {
  const baseUrl = import.meta.env.BASE_URL || ''
  const imagePath = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}photos/${photoFilename}`

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={imagePath}
        alt={`${firstName} ${lastName}`}
        loading="lazy"
        className="bg-white size-[120px] rounded-full object-contain"
      />
      <p className="text-center md:text-xl">
        <span>{firstName}</span>
        <br />
        <span>{lastName}</span>
      </p>
    </div>
  )
}
