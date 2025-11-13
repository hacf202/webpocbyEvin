// server.js

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

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
import VideoRoutes from "./src/routes/championVideos.js";
import buildsAdminRouter from "./src/routes/builds-admin.js";

dotenv.config();

// Kiểm tra các biến môi trường cần thiết
const requiredEnvVars = [
	"AWS_REGION",
	"AWS_ACCESS_KEY_ID",
	"AWS_SECRET_ACCESS_KEY",
	"COGNITO_USER_POOL_ID",
	"COGNITO_APP_CLIENT_ID",
	"FRONTEND_URL",
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
	console.error("Lỗi: Thiếu các biến môi trường:", missingEnvVars.join(", "));
	process.exit(1);
}

const app = express();
const port = process.env.PORT;

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
app.use(express.json({ limit: "50mb" }));

// --- API Routes ---

// Gắn các router vào ứng dụng
// Mọi request đến /api/auth sẽ được xử lý bởi authRouter
app.use("/api/auth", authRouter);

// Mọi request đến /api/champions sẽ được xử lý bởi championsRouter
app.use("/api/champions", championsRouter);

app.use("/api/powers", powersRoutes);

app.use("/api/generalPowers", generalPowersRoutes);

app.use("/api/relics", relicsRoutes);

app.use("/api/items", itemsRoutes);

app.use("/api/runes", runesRoutes);

app.use("/api/champion-videos", VideoRoutes);

// Mọi request đến /api/users và /api/user sẽ được xử lý bởi usersRouter
app.use("/api", usersRouter);

// Mọi request đến /api/builds sẽ được xử lý bởi buildsRouter
app.use("/api/builds", commentsRouter); // /:buildId/comments
app.use("/api/builds", favoritesRouter); // /:id/like, /:id/favorite, /favorites
app.use("/api/builds", buildsRouter);

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
app.listen(port, () => {
	console.log(`Server đang chạy trên http://localhost:${port}`);
});
