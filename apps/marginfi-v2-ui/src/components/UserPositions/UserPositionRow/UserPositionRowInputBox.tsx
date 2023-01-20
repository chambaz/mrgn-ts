import { TextField, InputAdornment, Button } from "@mui/material";
import { FC, MouseEvent } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

interface UserPositionRowInputBoxProps {
  value: number;
  setValue: (value: number) => void;
  maxValue?: number;
  maxDecimals?: number;
}

const UserPositionRowInputBox: FC<UserPositionRowInputBoxProps> = ({
  value,
  setValue,
  maxValue,
  maxDecimals,
}) => {
  const onClick = () => {
    if (maxValue !== undefined) {
      setValue(maxValue);
    }
  };

  const onChange = (event: NumberFormatValues) => {
    const updatedAmountStr = event.value;
    if (updatedAmountStr !== "" && !/^\d*\.?\d*$/.test(updatedAmountStr))
      return;
    const updatedAmount = Number(updatedAmountStr);
    if (maxValue !== undefined && updatedAmount > maxValue) {
      setValue(maxValue);
      return;
    }
    setValue(updatedAmount);
  };

  return (
    <NumericFormat
      value={value}
      placeholder="0"
      allowNegative={false}
      decimalScale={maxDecimals}
      onValueChange={onChange}
      thousandSeparator=","
      customInput={TextField}
      size="small"
      max={maxValue}
      InputProps={{
        className:
          "bg-[#1C2125] text-[#e1e1e1] text-base rounded-lg pr-0 w-full h-14 font-light",
        style: {
          fontFamily: "Aeonik Pro",
        },
        endAdornment: <MaxInputAdornment onClick={onClick} />,
      }}
    />
  );
};

// @todo not happy with how this looks on small screens
const MaxInputAdornment: FC<{
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ onClick }) => (
  <InputAdornment position="end">
    <Button
      classes={{
        root: "p-0 text-[#868E95] text-base lowercase h-9 font-light",
      }}
      style={{
        fontFamily: "Aeonik Pro",
      }}
      sx={{ "&:hover": { backgroundColor: "transparent" } }}
      onClick={onClick}
      variant="text"
      disableRipple
    >
      max
    </Button>
  </InputAdornment>
);

export { UserPositionRowInputBox };
