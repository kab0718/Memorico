import { css } from "@emotion/react";
import { Input } from "@mantine/core";

interface Props {
  title: string;
}

export const StepTitle = ({ title }: Props) => {
  return <Input.Label css={titleStyle}>{title}</Input.Label>;
};

const titleStyle = css`
  font-size: 20px;
  font-weight: 800;
`;
