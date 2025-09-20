import { memo } from "react";
import { Link, useParams } from "react-router-dom";
import itemsData from "../assets/data/items-vi_vn.json";
import championsData from "../assets/data/champions.json";

function ItemDetail() {
	const { itemCode } = useParams();
	const item = itemsData.find(
		item => item.itemCode === decodeURIComponent(itemCode)
	);

	// If item is not found, display error message
	if (!item) {
		return (
			<div className='p-4 sm:p-6 text-white'>
				Không tìm thấy thông tin vật phẩm. Mã: {itemCode}
			</div>
		);
	}

	// Find champions that use this item by matching item.name in defaultItems
	const compatibleChampions = championsData
		.filter(champion => champion.defaultItems?.some(r => r.S === item.name))
		.map(champion => ({
			name: champion.name,
			image: champion.assets[0]?.M.avatar.S || "/images/placeholder.png",
		}));

	return (
		<div className='relative mx-auto max-w-[1200px] p-4 sm:p-6 bg-gray-900 rounded-lg mt-10 text-white'>
			<div className='flex flex-col md:flex-row gap-4 bg-gray-800 rounded-md'>
				<img
					className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
					src={item.assetAbsolutePath || "/images/placeholder.png"}
					alt={item.name || "Unknown Item"}
					loading='lazy'
				/>
				<div className='flex-1 '>
					<div className='flex flex-col sm:flex-row sm:justify-between bg-gray-700 rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1'>
						<h1 className=''>{item.name}</h1>
						<h1>ĐỘ HIẾM: {item.rarity}</h1>
					</div>
					{item.description && (
						<p className='text-base sm:text-xl mt-4 mx-1 bg-gray-700 rounded-lg overflow-y-auto h-60 p-2'>
							{item.descriptionRaw}
						</p>
					)}
				</div>
			</div>

			<h2 className='text-xl sm:text-3xl font-semibold m-5'>
				Các tướng có thể dùng vật phẩm
			</h2>
			{compatibleChampions.length > 0 ? (
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-gray-700 rounded-md p-4'>
					{compatibleChampions.map((champion, index) => (
						<Link
							key={index}
							to={`/champion/${encodeURIComponent(champion.name)}`}
							className='bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition'
						>
							<img
								className='w-full max-w-[120px] h-auto mx-auto'
								src={champion.image}
								alt={champion.name}
								loading='lazy'
							/>
							<h3 className='text-base sm:text-lg font-semibold text-center mt-2'>
								{champion.name}
							</h3>
						</Link>
					))}
				</div>
			) : (
				<p className='text-base sm:text-lg bg-gray-700 rounded-md p-4'>
					Không có tướng nào sử dụng vật phẩm này.
				</p>
			)}
		</div>
	);
}

export default memo(ItemDetail);
