/**
 * AWSIcon component renders the AWS logo with a styled background.
 * @returns {JSX.Element}
 */
import React from "react";
import awsLogo from "../assets/aws-icon.webp";
import { ICON_SIZE } from "../utils.jsx";

const AWSIcon = () => (
  <div
    style={{
      background: "white",
      borderRadius: ICON_SIZE,
      padding: 3,
      display: "inline-block",
      width: ICON_SIZE,
      height: ICON_SIZE,
    }}
  >
    <img
      src={awsLogo}
      alt="AWS"
      style={{ width: ICON_SIZE, height: ICON_SIZE }}
    />
  </div>
);

export default AWSIcon; 