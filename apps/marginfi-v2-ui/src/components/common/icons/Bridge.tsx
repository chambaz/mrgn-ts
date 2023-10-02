import React, { FC, HTMLProps } from "react";

const Bridge: FC<HTMLProps<HTMLDivElement>> = ({ color = "#868E95", ...props }) => (
  <div {...props}>
    <svg fill={color} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
      <path d="M32 32C14.3 32 0 46.3 0 64S14.3 96 32 96H72v64H0V288c53 0 96 43 96 96v64c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V384c0-53 43-96 96-96s96 43 96 96v64c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V384c0-53 43-96 96-96V160H504V96h40c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM456 96v64H376V96h80zM328 96v64H248V96h80zM200 96v64H120V96h80z" />
    </svg>
  </div>
);

export { Bridge };
