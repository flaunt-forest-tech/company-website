type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="row justify-content-center">
      <div className="col-lg-10 text-center">
        <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
          {eyebrow}
        </span>
        <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">{title}</h2>
        {description ? <p className="custom-text-size-1 mb-0">{description}</p> : null}
      </div>
    </div>
  );
}
