import json

# Tên của tệp JSON gốc bạn đã tải lên
input_filename = 'powers-vi_vn.json'
# Tên của tệp mới sẽ được tạo
output_filename = 'general_powers_only.json'

# Danh sách để lưu trữ các năng lượng đã lọc
filtered_powers = []

try:
    # Mở và đọc tệp JSON gốc
    # Sử dụng encoding='utf-8' để đảm bảo đọc đúng ký tự tiếng Việt
    with open(input_filename, 'r', encoding='utf-8') as f:
        all_powers_data = json.load(f)

    # Lặp qua từng mục (power) trong dữ liệu
    for power in all_powers_data:
        # Kiểm tra xem khóa 'type' có tồn tại không VÀ "General Power" CÓ NẰM TRONG danh sách 'type' không
        if 'type' in power and "General Power" in power['type']:
            # Nếu đúng, thêm mục này vào danh sách đã lọc
            filtered_powers.append(power)

    # Ghi danh sách đã lọc vào một tệp JSON mới
    # indent=4 để tệp JSON mới dễ đọc hơn (pretty-print)
    # ensure_ascii=False để giữ nguyên ký tự tiếng Việt
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(filtered_powers, f, indent=4, ensure_ascii=False)

    print(f"Hoàn tất! Đã tìm thấy {len(filtered_powers)} năng lượng 'General Power'.")
    print(f"Dữ liệu đã được lưu vào tệp: {output_filename}")

except FileNotFoundError:
    print(f"LỖI: Không tìm thấy tệp '{input_filename}'.")
    print("Vui lòng đảm bảo tệp này nằm cùng thư mục với script Python.")
except json.JSONDecodeError:
    print(f"LỖI: Không thể đọc tệp JSON '{input_filename}'. Tệp có thể bị hỏng.")
except Exception as e:
    print(f"Đã xảy ra lỗi không mong muốn: {e}")

