// Một tệp trợ giúp nhỏ để xử lý logic lặp đi lặp lại trong các lệnh gọi fetch, giúp authService.js gọn gàng hơn.
const COGNITO_URL = "https://cognito-idp.us-east-1.amazonaws.com";
const BACKEND_URL = import.meta.env.VITE_API_URL;

/**
 * Hàm chung để gọi API của AWS Cognito.
 * @param {string} target - Target của AWS, ví dụ: "AWSCognitoIdentityProviderService.SignUp".
 * @param {object} body - Nội dung của request.
 * @returns {Promise<any>} - Dữ liệu trả về từ API.
 */
async function cognitoApiRequest(target, body) {
	const response = await fetch(COGNITO_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-amz-json-1.1",
			"X-Amz-Target": target,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		// Cố gắng phân tích lỗi để thông báo rõ ràng hơn
		const errorText = await response.text();
		try {
			const errorJson = JSON.parse(errorText);
			throw new Error(
				errorJson.message ||
					errorJson.__type ||
					`Lỗi Cognito (mã: ${response.status})`
			);
		} catch {
			throw new Error(`Lỗi Cognito (mã: ${response.status}): ${errorText}`);
		}
	}

	// Đối với một số API thành công không trả về body (ví dụ: ConfirmForgotPassword)
	const responseText = await response.text();
	return responseText ? JSON.parse(responseText) : {};
}

/**
 * Hàm chung để gọi API backend của bạn.
 * @param {string} endpoint - Đường dẫn API, ví dụ: "/api/auth/forgot-password-strict".
 * @param {string} method - Phương thức HTTP (GET, POST, PUT, DELETE).
 * @param {object} body - Nội dung của request (cho POST, PUT).
 * @param {string|null} token - ID token để xác thực.
 * @returns {Promise<any>} - Dữ liệu trả về từ API.
 */
async function backendApiRequest(
	endpoint,
	method = "GET",
	body = null,
	token = null
) {
	const headers = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const config = {
		method,
		headers,
	};
	if (body) {
		config.body = JSON.stringify(body);
	}

	const response = await fetch(`${BACKEND_URL}${endpoint}`, config);
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || `Lỗi máy chủ (mã: ${response.status})`);
	}
	return data;
}

export { cognitoApiRequest, backendApiRequest };
