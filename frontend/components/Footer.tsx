"use client";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useRouter } from "next/navigation";

const Footer = () => {
    return <div style={{ position: "fixed", bottom: 16, display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center", padding: 16, maxWidth: 660, width: "100%" }}>
        <p style={{ flex: 1 }}>CoinFlip by 0xNascosta</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "absolute", right: 16, }}>
            <a target="_blank" href="https://twitter.com/0xNascosta" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTwitter} size="2x" style={{ color: "#74C0FC" }} />
            </a>
            <a target="_blank" href="https://github.com/RamanSB" rel="noopener noreferrer" style={{ color: "white" }}>
                <GitHubIcon style={{ fontSize: 36 }} />
            </a>
        </div>
    </div>
}

export default Footer;