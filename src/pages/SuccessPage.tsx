import { Link } from "react-router-dom";

const SuccessPage = () => (
  <div className="px-5 pt-20 pb-10 text-center min-h-screen">
    <div className="text-[56px] mb-4">🎉</div>
    <h2 className="font-display text-[28px] mb-2">Order placed!</h2>
    <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
      Thanks! We'll reach out on the number you provided to confirm and arrange delivery on campus.
    </p>
    <Link
      to="/"
      className="inline-block bg-primary text-primary-foreground w-full py-3.5 rounded-[14px] text-sm font-medium mt-7"
    >
      Back to catalog
    </Link>
  </div>
);

export default SuccessPage;
