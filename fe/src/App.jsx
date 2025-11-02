// src/App.jsx

// --- Phần 1: Import ---
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Champions from "./pages/champions.jsx";
import ChampionDetail from "./pages/championDetail.jsx";
import Relics from "./pages/relics.jsx";
import RelicDetail from "./pages/relicDetail.jsx";
import Powers from "./pages/powers.jsx";
import PowerDetail from "./pages/powerDetail.jsx";
import Items from "./pages/Items.jsx";
import ItemDetail from "./pages/itemDetail.jsx";
import Builds from "./pages/builds.jsx";
import BuildDetail from "./pages/BuildDetail.jsx";
import Runes from "./pages/runes.jsx";
import RuneDetail from "./pages/runeDetail.jsx";
import RandomizerPage from "./pages/RandomizerPage.jsx";
import Profile from "./pages/Profile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import ChampionEditor from "./pages/ChampionEditor.jsx";
import PowerEditor from "./pages/PowerEditor";
import RelicEditor from "./pages/RelicEditor.jsx";
import ItemEditor from "./pages/ItemEditor.jsx";
import RuneEditor from "./pages/RuneEditor.jsx";
import Navbar from "./components/layout/navbar.jsx";
import Footer from "./components/layout/footer.jsx";
import AuthContainer from "./components/auth/AuthContainer.jsx";
import PrivateRoute from "./components/common/PrivateRoute.jsx"; // Đảm bảo đã tạo file này

// --- Phần 2: Component App ---
function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<div className='flex flex-col min-h-screen'>
					<Navbar />
					<main className='flex-grow container mx-auto px-4 py-8'>
						<Routes>
							{/* --- Các Route công khai --- */}
							<Route path='/' element={<Home />} />
							<Route path='/profile' element={<Profile />} />
							<Route path='/champions' element={<Champions />} />
							<Route path='/champion/:name' element={<ChampionDetail />} />
							<Route path='/relics' element={<Relics />} />
							<Route path='/relic/:relicCode' element={<RelicDetail />} />
							<Route path='/powers' element={<Powers />} />
							<Route path='/power/:powerCode' element={<PowerDetail />} />
							<Route path='/items' element={<Items />} />
							<Route path='/item/:itemCode' element={<ItemDetail />} />
							<Route path='/builds' element={<Builds />} />
							<Route path='/builds/:buildId' element={<BuildDetail />} />
							<Route path='/runes' element={<Runes />} />
							<Route path='/rune/:runeCode' element={<RuneDetail />} />
							<Route path='/randomizer' element={<RandomizerPage />} />
							<Route
								path='/auth'
								element={
									<AuthContainer onClose={() => window.history.back()} />
								}
							/>

							{/* --- Các Route được bảo vệ cho Admin --- */}
							{/* Bọc tất cả các route admin trong PrivateRoute.
                                Mỗi route admin bây giờ là một trang riêng biệt.
                            */}
							<Route element={<PrivateRoute />}>
								<Route path='/admin' element={<AdminPanel />} />
								<Route
									path='/admin/championEditor'
									element={<ChampionEditor />}
								/>
								<Route path='/admin/powerEditor' element={<PowerEditor />} />
								<Route path='/admin/relicEditor' element={<RelicEditor />} />
								<Route path='/admin/itemEditor' element={<ItemEditor />} />
								<Route path='/admin/runeEditor' element={<RuneEditor />} />
							</Route>
						</Routes>
					</main>
					<Footer />
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
