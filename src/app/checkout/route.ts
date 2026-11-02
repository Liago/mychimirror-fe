import { redirect } from "next/navigation";

import { checkoutUrl } from "@/lib/cart";

// Il checkout resta su WordPress (gateway di pagamento invariati):
// reindirizziamo passando il Cart-Token, che il mu-plugin usa per riprendere il carrello
export async function GET() {
	redirect(await checkoutUrl());
}
