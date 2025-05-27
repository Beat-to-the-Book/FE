import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import Layout from "./components/Layout";

function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path='/login' element={<LoginPage />} />
					<Route path='/signup' element={<SignupPage />} />
					<Route path='/' element={<HomePage />} />
					<Route path='/book/:bookId' element={<BookDetailPage />} />
					<Route path='/cart' element={<CartPage />} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
