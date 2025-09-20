import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/navbar";
import Champions from "./pages/champions";
import ChampionDetail from "./pages/championDetail";
import Relics from "./pages/relics";
import RelicDetail from "./pages/relicDetail";
import Powers from "./pages/powers";
import PowerDetail from "./pages/powerDetail";
import Items from "./pages/Items";
import ItemDetail from "./pages/itemDetail";
import Builds from "./pages/builds";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Footer from "./components/layout/footer";
import CommentsPage from "./pages/CommentsPage"; // Import component mới

function App() {
	// console.log("All env vars:", import.meta.env); // Debug env variables
	return (
		<AuthProvider>
			<BrowserRouter>
				<div className='flex flex-col min-h-screen bg-gray-950'>
					<Navbar />
					<main className='flex-grow container mx-auto p-4'>
						<Routes>
							<Route path='/' element={<Champions />} />
							<Route path='/champions' element={<Champions />} />
							<Route path='/champion/:name' element={<ChampionDetail />} />
							<Route path='/relics' element={<Relics />} />
							<Route path='/relic/:relicCode' element={<RelicDetail />} />
							<Route path='/powers' element={<Powers />} />
							<Route path='/power/:powerCode' element={<PowerDetail />} />
							<Route path='/items' element={<Items />} />
							<Route path='/item/:itemCode' element={<ItemDetail />} />
							<Route path='/builds' element={<Builds />} />
							<Route path='/comments' element={<CommentsPage />} />{" "}
							{/* Route mới */}
							<Route
								path='/login'
								element={<Login onClose={() => window.history.back()} />}
							/>
							<Route
								path='/register'
								element={<Register onClose={() => window.history.back()} />}
							/>
						</Routes>
					</main>
					<Footer />
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
