import { useLocation } from "react-router-dom";
import Header from "./Header";

const Layout = ({ children }) => {
	const location = useLocation();
	const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

	return (
		<div className='min-h-screen bg-gray-50'>
			{!isAuthPage && <Header />}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>{children}</main>
		</div>
	);
};

export default Layout;
