import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import Layout from "./components/Layout";
import SearchPage from "./pages/SearchPage";
import MiniGamePage from "./pages/MiniGamePage";
import CommunityPage from "./pages/CommunityPage";
import GroupPage from "./pages/GroupPage";
import PostPage from "./pages/PostPage";
import WritePostPage from "./pages/WritePostPage";
import MyPage from "./pages/MyPage";
import ReportsPage from "./pages/ReportsPage";
import WriteReportPage from "./pages/WriteReportPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import BookshelfPage from "./pages/BookshelfPage.jsx";

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
					<Route path='/search' element={<SearchPage />} />
					<Route path='/minigame' element={<MiniGamePage />} />
					<Route path='/mypage' element={<MyPage />} />
					<Route path='/community' element={<CommunityPage />} />
					<Route path='/community/:groupId' element={<GroupPage />} />
					<Route path='/community/:groupId/posts/:postId' element={<PostPage />} />
					<Route path='/community/:groupId/write' element={<WritePostPage />} />
					<Route path='/reports' element={<ReportsPage />} />
					<Route path='/reports/:reportId' element={<ReportDetailPage />} />
					<Route path='/write-report' element={<WriteReportPage />} />
					<Route path='/write-report/:bookId' element={<WriteReportPage />} />
					<Route path='/bookshelf' element={<BookshelfPage />} />
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
