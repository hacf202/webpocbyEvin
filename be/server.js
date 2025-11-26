// server.js
import express from "express"; //tạo server HTTP, các route GET, PUT, POST, DELETE,..
import cors from "cors"; //cho phép front end gọi api của backend
import morgan from "morgan"; //in ra console mỗi khi api được gọi (phương thức, đường dẫn, trạng thái, thời gian phản hồi)
import dotenv from "dotenv"; //giúp tải biến môi trường

// Import các router từ thư mục src/routes
import authRouter from "./src/routes/auth.js";
import championsRouter from "./src/routes/champions.js";
import usersRouter from "./src/routes/users.js";
import buildsRouter from "./src/routes/builds.js";
import commentsRouter from "./src/routes/comments.js";
import favoritesRouter from "./src/routes/favorites.js";
import powersRoutes from "./src/routes/powers.js";
import generalPowersRoutes from "./src/routes/generalPower.js";
import relicsRoutes from "./src/routes/relics.js";
import itemsRoutes from "./src/routes/items.js";
import runesRoutes from "./src/routes/runes.js";
import buildsAdminRouter from "./src/routes/builds-admin.js";

dotenv.config(); //đọc .env tải biến môi trường

// Kiểm tra các biến môi trường cần thiết
const requiredEnvVars = [
	"AWS_REGION", //khu vực
	"AWS_ACCESS_KEY_ID", //Key IAM user
	"AWS_SECRET_ACCESS_KEY", //Secret key của IAM user đó
	"COGNITO_USER_POOL_ID", //id của user pool
	"COGNITO_APP_CLIENT_ID", //client id của app
	"FRONTEND_URL", //domain fe
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
	console.error("Lỗi: Thiếu các biến môi trường:", missingEnvVars.join(", "));
	// Khi chạy local, chúng ta nên thoát
	if (!process.env.VERCEL) {
		process.exit(1);
	}
}

const app = express();

// --- Middleware ---
app.use(morgan("dev")); // Ghi log request ra console

// Cấu hình CORS
const allowedOrigins = [
	process.env.FRONTEND_URL,
	"http://localhost:5173",
	"https://guidepoc.vercel.app",
	"https://www.pocguide.top",
];
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Không được phép bởi CORS"));
			}
		},
	})
);

// Middleware để phân tích cú pháp JSON
// ⚠️ Cảnh báo: Vercel miễn phí có giới hạn ~4.5MB. 50mb sẽ thất bại trên Vercel.
app.use(express.json({ limit: "50mb" }));

// --- API Routes ---

// Gắn các router vào ứng dụng
app.use("/api/auth", authRouter);
app.use("/api/champions", championsRouter);
app.use("/api/powers", powersRoutes);
app.use("/api/generalPowers", generalPowersRoutes);
app.use("/api/relics", relicsRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/runes", runesRoutes);
app.use("/api", usersRouter);
app.use("/api/builds", commentsRouter);
app.use("/api/builds", favoritesRouter);
app.use("/api/builds", buildsRouter); // ĐỂ CUỐI CÙNG!
app.use("/api/admin/builds", buildsAdminRouter);

// API để kiểm tra "sức khỏe" của server
app.get("/api/checkheal", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// --- Xử lý lỗi ---

// Middleware xử lý lỗi 404 cho các route không tồn tại
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// --- Khởi động Server ---

// 1. Export app cho Vercel (bắt buộc)
// Vercel sẽ sử dụng app này để chạy serverless function
export default app;

// 2. Chạy server local (chỉ khi không ở trên Vercel)
// Vercel tự động set biến môi trường 'VERCEL' = 1
if (!process.env.VERCEL) {
	const port = process.env.PORT; // Dùng port từ .env hoặc fallback 3001
	app.listen(port, () => {
		console.log(
			`✅ Server đang chạy (chế độ local) trên http://localhost:${port}`
		);
	});
}
