import json
from pprint import pprint

def lay_thuoc_tinh_ten_khong_trung(duong_dan_tep_mot, duong_dan_tep_hai, xuat_file=False, ten_file_xuat="ket_qua_khong_trung.json"):
    """
    Tìm các tên không trùng lặp giữa 2 file JSON, rồi lấy toàn bộ thuộc tính của các đối tượng đó.
    
    Args:
        duong_dan_tep_mot (str): Đường dẫn file JSON 1.
        duong_dan_tep_hai (str): Đường dẫn file JSON 2.
        xuat_file (bool): Có xuất ra file JSON không?
        ten_file_xuat (str): Tên file xuất (nếu có).
    
    Returns:
        dict: { "file1": [...], "file2": [...] } chứa các đối tượng không trùng.
    """
    try:
        # Đọc dữ liệu
        with open(duong_dan_tep_mot, 'r', encoding='utf-8') as f1:
            data1 = json.load(f1)
        with open(duong_dan_tep_hai, 'r', encoding='utf-8') as f2:
            data2 = json.load(f2)

        # Tạo dict: tên -> đối tượng
        dict1 = {item['name']: item for item in data1 if 'name' in item}
        dict2 = {item['name']: item for item in data2 if 'name' in item}

        # Tìm tên chỉ có ở file 1
        ten_chi_o_file1 = dict1.keys() - dict2.keys()
        ket_qua_file1 = [dict1[ten] for ten in ten_chi_o_file1]

        # Tìm tên chỉ có ở file 2
        ten_chi_o_file2 = dict2.keys() - dict1.keys()
        ket_qua_file2 = [dict2[ten] for ten in ten_chi_o_file2]

        # Kết quả tổng
        ket_qua = {
            "chi_co_trong_file1": ket_qua_file1,
            "chi_co_trong_file2": ket_qua_file2,
            "tong_so_khong_trung": len(ket_qua_file1) + len(ket_qua_file2)
        }

        # In kết quả
        print(f"Tìm thấy {len(ket_qua_file1)} tên chỉ có trong {duong_dan_tep_mot}")
        print(f"Tìm thấy {len(ket_qua_file2)} tên chỉ có trong {duong_dan_tep_hai}\n")

        if ket_qua_file1:
            print("Chỉ có trong FILE 1:")
            for item in ket_qua_file1:
                print(f"→ {item['name']} (P{item.get('powerCode', '???')})")
        if ket_qua_file2:
            print("\nChỉ có trong FILE 2:")
            for item in ket_qua_file2:
                print(f"→ {item['name']} (P{item.get('powerCode', '???')})")

        # Xuất file nếu yêu cầu
        if xuat_file:
            with open(ten_file_xuat, 'w', encoding='utf-8') as f:
                json.dump(ket_qua, f, ensure_ascii=False, indent=2)
            print(f"\nĐã xuất kết quả ra file: {ten_file_xuat}")

        return ket_qua

    except FileNotFoundError as e:
        print(f"Lỗi: Không tìm thấy tệp → {e}")
    except json.JSONDecodeError as e:
        print(f"Lỗi: JSON không hợp lệ → {e}")
    except Exception as e:
        print(f"Lỗi không xác định: {e}")
    
    return None


# ———— CÁCH DÙNG ————
if __name__ == "__main__":
    file1 = 'items-vi_vn.json'
    file2 = 'items1-vi_vn.json'

    ket_qua = lay_thuoc_tinh_ten_khong_trung(
        duong_dan_tep_mot=file1,
        duong_dan_tep_hai=file2,
        xuat_file=True,                    # Đổi thành False nếu không muốn xuất file
        ten_file_xuat="powers_khong_trung.json"
    )

    # Nếu muốn xem chi tiết 1 object:
    if ket_qua and ket_qua['chi_co_trong_file2']:
        print("\nVí dụ 1 object mới:")
        pprint(ket_qua['chi_co_trong_file2'][0])