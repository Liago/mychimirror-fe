import Link from "next/link";

const buttonClassName =
	"inline-block border border-black bg-black px-[34px] py-2.5 font-open-sans text-[11px] font-medium uppercase leading-[22px] tracking-[0.4em] text-white transition-colors hover:bg-transparent hover:text-black disabled:opacity-50";

type Props =
	| ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className">)
	| ({ href?: undefined } & Omit<
			React.ButtonHTMLAttributes<HTMLButtonElement>,
			"className"
	  >);

/**
 * Bottone "filled" del tema: link se riceve `href`, altrimenti <button>.
 */
const Button = (props: Props) => {
	if (props.href !== undefined) {
		return <Link {...props} className={buttonClassName} />;
	}
	const { type = "button", ...rest } = props;
	return <button type={type} {...rest} className={buttonClassName} />;
};

export default Button;
