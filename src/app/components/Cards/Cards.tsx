import React from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";

import { formatDateTime } from "@/utility/utils";
import Divider from "../hoc/Divider";

type Props = {
  title: string;
  postedOn: string;
  tags: string;
  comments: number;
  imageUrl: string;
};
const CardContainer = (props: Props) => {
  const { postedOn, title, tags, comments, imageUrl } = props;

  let postedDate = formatDateTime(postedOn);

  return (
    <Card className="p-4 mx-4" shadow="sm" isPressable>
      <CardHeader
        className="overflow-visible p-0"
        style={{
          width: "350px",
          height: "292px",
          background: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      />
      <CardBody className="overflow-visible pt-6">
        <Divider border="1">
          <p className="text-tiny uppercase">{postedDate}</p>
          <h2 className="text-3xl my-2">{title}</h2>
        </Divider>
        <h4 className="text-small text-right">{comments} comments</h4>
      </CardBody>
    </Card>
  );
};

export default CardContainer;
