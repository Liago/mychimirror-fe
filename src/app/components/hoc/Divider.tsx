const Divider = ({
  children, border
}: {
  children: React.ReactNode;
  border: string;
}) => {
  return <div className={`bordered border-b-${border} my-6`}>{children}</div>;
};

export default Divider;
