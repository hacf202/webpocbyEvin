// src/utils/dynamodb.js

/**
 * Chuyển boolean → string cho DynamoDB
 */
export const boolToString = value => {
	if (value === true) return "true";
	if (value === false) return "false";
	return undefined; // nếu không phải boolean
};

/**
 * Chuyển string từ DynamoDB → boolean
 */
export const stringToBool = value => {
	if (value === "true") return true;
	if (value === "false") return false;
	return undefined; // hoặc giữ nguyên nếu không phải "true"/"false"
};

/**
 * Áp dụng chuyển đổi display trong object trước khi lưu vào DynamoDB
 */
export const prepareBuildForDynamo = build => {
	if (build.display !== undefined) {
		build.display = boolToString(build.display);
	}
	return build;
};

/**
 * Áp dụng chuyển đổi display từ DynamoDB về boolean
 */
export const normalizeBuildFromDynamo = build => {
	if (build.display !== undefined) {
		build.display = stringToBool(build.display);
	}
	return build;
};
