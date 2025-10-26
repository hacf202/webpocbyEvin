import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // Thêm .jsx
import Home from "./pages/Home.jsx";
import Navbar from "./components/layout/navbar.jsx"; // Thêm .jsx
import Champions from "./pages/champions.jsx"; // Thêm .jsx
import ChampionDetail from "./pages/championDetail.jsx"; // Thêm .jsx
import Relics from "./pages/relics.jsx"; // Thêm .jsx
import RelicDetail from "./pages/relicDetail.jsx"; // Thêm .jsx
import Powers from "./pages/powers.jsx"; // Thêm .jsx
import PowerDetail from "./pages/powerDetail.jsx"; // Thêm .jsx
import Items from "./pages/Items.jsx"; // Thêm .jsx
import ItemDetail from "./pages/itemDetail.jsx"; // Thêm .jsx
import Builds from "./pages/builds.jsx"; // Thêm .jsx
import BuildDetail from "./pages/BuildDetail.jsx";
import Runes from "./pages/runes.jsx";
import RuneDetail from "./pages/runeDetail.jsx";
import RandomizerPage from "./pages/RandomizerPage.jsx";
import AuthContainer from "./components/auth/AuthContainer.jsx"; // THÊM COMPONENT MỚI
import Footer from "./components/layout/footer.jsx"; // Thêm .jsx
import Profile from "./pages/Profile.jsx";
function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<div className='flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]'>
					<Navbar />
					<main className='flex-grow container mx-auto p-4'>
						<Routes>
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
							{/* Route mới duy nhất cho Đăng nhập/Đăng ký */}
							<Route
								path='/auth'
								element={
									<AuthContainer onClose={() => window.history.back()} />
								}
							/>

							{/* Xóa Route /login và /register cũ */}
							{/*
							<Route
								path='/login'
								element={<Login onClose={() => window.history.back()} />}
							/>
							<Route
								path='/register'
								element={<Register onClose={() => window.history.back()} />}
							/>
							*/}
						</Routes>
					</main>
					<Footer />
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
