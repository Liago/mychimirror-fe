import Link from "next/link";

const baseClassName =
	"inline-block border border-black px-[34px] py-2.5 font-open-sans text-[11px] font-medium uppercase leading-[22px] tracking-[0.4em] transition-colors disabled:opacity-50";

const variantClassName = {
	filled: "bg-black text-white hover:bg-transparent hover:text-black",
	outlined: "bg-transparent text-black hover:bg-black hover:text-white",
};

type Variant = keyof typeof variantClassName;

type Props = { variant?: Variant } & (
	| ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className">)
	| ({ href?: undefined } & Omit<
			React.ButtonHTMLAttributes<HTMLButtonElement>,
			"className"
	  >)
);

/**
 * Bottone del tema: link se riceve `href`, altrimenti <button>.
 */
const Button = ({ variant = "filled", ...props }: Props) => {
	const className = `${baseClassName} ${variantClassName[variant]}`;
	if (props.href !== undefined) {
		return <Link {...props} className={className} />;
	}
	const { type = "button", ...rest } = props;
	return <button type={type} {...rest} className={className} />;
};

export default Button;
