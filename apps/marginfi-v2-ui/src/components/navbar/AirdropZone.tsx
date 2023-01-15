import { Button, Modal } from "@mui/material";
import { FC, useCallback, useState } from "react";
import { NavbarCenterItem } from "./NavbarCenterItem";
import styles from "./AirdropZone.module.css";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "~/utils/spl";
import { makeAirdropCollateralIx } from "~/utils";
import { toast } from "react-toastify";
import { shortenAddress } from "@mrgnlabs/marginfi-client-v2";

const SOL_AMOUNT = 10 * 10 ** 9;
const SOL_MINT = new PublicKey("4Bn9Wn1sgaD5KfMRZjxwKFcrUy6NKdyqLPtzddazYc4x");
const SOL_FAUCET = new PublicKey("tRqMXrkJysM78qhriPH8GmKza75e2ikqWSDwa3soxuB");

const USDC_AMOUNT = 10 * 10 ** 6;
const USDC_MINT = new PublicKey("F9jRT1xL7PCRepBuey5cQG5vWHFSbnvdWxJWKqtzMDsd");
const USDC_FAUCET = new PublicKey(
  "3ThaREisq3etoy9cvdzRgKypHsa8iTjMxj19AjETA1Fy"
);

const AirdropZone: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  const open = useCallback(async () => setIsOpen(true), []);
  const close = useCallback(async () => setIsOpen(false), []);

  const airdropToken = useCallback(
    async (amount: number, mint: PublicKey, faucet: PublicKey) => {
      if (faucet && wallet.publicKey) {
        const ataAddress = getAssociatedTokenAddressSync(
          mint,
          wallet.publicKey!
        );
        const ixs = [];
        const solBalance = await connection.getBalance(wallet.publicKey);
        if (solBalance < 0.05) {
          await connection.requestAirdrop(wallet.publicKey, 100000000);
        }
        const ataAi = await connection.getAccountInfo(ataAddress);
        if (!ataAi) {
          ixs.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              ataAddress,
              wallet.publicKey,
              mint
            )
          );
        }
        ixs.push(makeAirdropCollateralIx(amount, mint, ataAddress, faucet));

        const tx = new Transaction();
        tx.add(...ixs);

        await wallet.sendTransaction(tx, connection, {
          skipPreflight: true,
        });
      }
    },
    [connection, wallet]
  );

  return (
    <div>
      <NavbarCenterItem text="Airdrop" onClick={open} />
      <Modal
        open={isOpen}
        onClose={close}
        aria-labelledby="title"
        aria-describedby="description"
      >
        <div id={styles["container"]}>
          <div id={styles["overlay"]}>
            <p id={styles["title"]}>💰 Airdrop Zone 💰</p>
            <Button
              onClick={async () => {
                const toastId = toast.loading(
                  `Airdropping ${USDC_AMOUNT} USDC`
                );
                try {
                  await airdropToken(USDC_AMOUNT, USDC_MINT, USDC_FAUCET);
                  toast.update(toastId, {
                    render: `Airdropped ${USDC_AMOUNT} USDC to ${shortenAddress(
                      wallet.publicKey!
                    )}`,
                    type: toast.TYPE.SUCCESS,
                    autoClose: 5000,
                    isLoading: false,
                  });
                } catch (error: any) {
                  toast.update(toastId, {
                    render: `Error during USDC airdrop: ${error.message}`,
                    type: toast.TYPE.ERROR,
                    autoClose: 5000,
                    isLoading: false,
                  });
                }
              }}
            >
              Airdrop USDC
            </Button>
            <Button
              onClick={async () => {
                const toastId = toast.loading(`Airdropping ${SOL_AMOUNT} SOL`);
                try {
                  await airdropToken(SOL_AMOUNT, SOL_MINT, SOL_FAUCET);
                  toast.update(toastId, {
                    render: `Airdropped ${SOL_AMOUNT} SOL to ${shortenAddress(
                      wallet.publicKey!
                    )}`,
                    type: toast.TYPE.SUCCESS,
                    autoClose: 5000,
                    toastId,
                    isLoading: false,
                  });
                } catch (error: any) {
                  toast.update(toastId, {
                    render: `Error during SOL airdrop: ${error.message}`,
                    type: toast.TYPE.ERROR,
                    autoClose: 5000,
                    toastId,
                    isLoading: false,
                  });
                }
              }}
            >
              Airdrop SOL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AirdropZone;
