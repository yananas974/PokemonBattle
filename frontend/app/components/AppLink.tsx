import { Link } from "@remix-run/react";

type AppLinkProps = {
    to: string;
    children: React.ReactNode;
}

const AppLink = ({ to, children }: AppLinkProps) => {
  const baseClasse =    'inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105';

    return <Link to={to}>{children}</Link>
}

export default AppLink;