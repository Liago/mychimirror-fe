import React from "react";
import NextLink from "next/link";

import { formatDateTime } from "@/utility/utils";
import Divider from "../hoc/Divider";

type Props = {
  slug: string;
  title: string;
  postedOn: string;
  tags: string;
  comments: number;
  imageUrl: string;
};
const CardContainer = (props: Props) => {
  const { slug, postedOn, title, tags, comments, imageUrl } = props;

  let postedDate = formatDateTime(postedOn);

  return (
    <NextLink
      href={`/posts/${slug}/`}
      className="relative mx-4 flex flex-col overflow-hidden rounded-large bg-white p-4 text-foreground shadow-small transition-transform active:scale-[0.97]"
    >
      <div
        className="aspect-[350/292] w-full max-w-[350px] shrink-0 rounded-t-large"
        style={{
          background: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      />
      <div className="flex w-full flex-auto flex-col break-words px-3 pb-3 pt-6 text-left">
        <Divider border="1">
          <p className="text-tiny uppercase">{postedDate}</p>
          <h2 className="text-3xl my-2">{title}</h2>
        </Divider>
        <h4 className="text-small text-right">{comments} comments</h4>
      </div>
    </NextLink>
  );
};

export default CardContainer;
