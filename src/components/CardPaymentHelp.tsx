// Native <details> so it works without any client JS. Explains how a customer
// with only a card / Apple Pay / Google Pay can still pay: buy the crypto with
// their card via a reputable on-ramp and send it to the payment address. We
// settle in crypto; the customer does their own (on-ramp) KYC, so the store
// needs no card processor or verification.
export default function CardPaymentHelp() {
  return (
    <details className="rounded-lg border border-black/10 bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-navy">
        💳 Paying with a debit/credit card, Apple Pay, or Google Pay?
      </summary>
      <div className="border-t border-black/10 px-4 py-4 text-sm text-zinc-600">
        <p>
          We settle in crypto, but you can still pay with a card — buy the crypto
          with your card in a couple of minutes and it counts as your payment:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            On the payment page, note the <strong>coin, network, exact amount,
            and wallet address</strong> shown.
          </li>
          <li>
            Open a card-to-crypto service —{" "}
            <a
              href="https://www.moonpay.com/buy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy underline"
            >
              MoonPay
            </a>
            ,{" "}
            <a
              href="https://www.coinbase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy underline"
            >
              Coinbase
            </a>
            , or{" "}
            <a
              href="https://transak.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-navy underline"
            >
              Transak
            </a>{" "}
            — and buy that coin with your card, Apple Pay, or Google Pay.
          </li>
          <li>
            Set the <strong>delivery/withdrawal address</strong> to the wallet
            address from the payment page (make sure the <strong>network
            matches</strong>). Buy a little extra to cover network fees so the
            payment isn&apos;t short.
          </li>
          <li>Once it arrives on-chain, your order confirms automatically.</li>
        </ol>
        <p className="mt-3 text-xs text-zinc-400">
          First-time card purchases need a quick ID check with the on-ramp
          (their requirement, not ours). Fees and minimum purchase amounts
          apply.
        </p>
      </div>
    </details>
  );
}
