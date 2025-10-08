import { useState } from "react";

const ReadingCalendar = ({ readings = [], onDateClick, selectedDate }) => {
	const [currentDate, setCurrentDate] = useState(new Date());

	// 책별로 다른 색상 팔레트 (primary 계열)
	const colorPalette = [
		{ bg: "#E8F5F4", text: "#023430", border: "#00ED64" }, // 기본 청록
		{ bg: "#F0FDF4", text: "#14532D", border: "#4DFF9D" }, // 라임
		{ bg: "#E0F2FE", text: "#0C4A6E", border: "#38BDF8" }, // 블루
		{ bg: "#EFF6FF", text: "#1E3A8A", border: "#60A5FA" }, // 인디고
		{ bg: "#F0FDFA", text: "#134E4A", border: "#5EEAD4" }, // 틸
		{ bg: "#ECFDF5", text: "#065F46", border: "#6EE7B7" }, // 에메랄드
	];

	const getColorForBook = (bookId) => {
		return colorPalette[bookId % colorPalette.length];
	};

	const getMonthData = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		return {
			year,
			month,
			daysInMonth,
			startingDayOfWeek,
		};
	};

	const { year, month, daysInMonth, startingDayOfWeek } = getMonthData();

	// 날짜별 독서 기록 매핑
	const getReadingsForDate = (date) => {
		const targetDate = new Date(year, month, date);
		const targetDateStr = targetDate.toISOString().split("T")[0];

		return readings.filter((reading) => {
			const start = new Date(reading.startDate);
			const end = new Date(reading.endDate);
			const target = new Date(targetDateStr);

			// 날짜 비교 (시간 제외)
			start.setHours(0, 0, 0, 0);
			end.setHours(0, 0, 0, 0);
			target.setHours(0, 0, 0, 0);

			return target >= start && target <= end;
		});
	};

	const handlePrevMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const renderCalendarDays = () => {
		const days = [];
		const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

		// 요일 헤더
		weekDays.forEach((day, index) => {
			const isWeekend = index === 0 || index === 6;
			days.push(
				<div
					key={`weekday-${index}`}
					className={`text-center font-bold py-3 text-sm ${
						isWeekend ? "text-red-500" : "text-gray-700"
					}`}
				>
					{day}
				</div>
			);
		});

		// 빈 칸
		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(<div key={`empty-${i}`} className='bg-gray-50/50'></div>);
		}

		// 날짜
		for (let date = 1; date <= daysInMonth; date++) {
			const dayReadings = getReadingsForDate(date);
			const currentDateObj = new Date(year, month, date);
			const isToday = currentDateObj.toDateString() === new Date().toDateString();
			const isSelected =
				selectedDate && currentDateObj.toDateString() === new Date(selectedDate).toDateString();
			const isWeekend = currentDateObj.getDay() === 0 || currentDateObj.getDay() === 6;
			const hasReadings = dayReadings.length > 0;

			days.push(
				<div
					key={`day-${date}`}
					className={`min-h-28 border p-2 cursor-pointer transition-all duration-200 group relative rounded-lg
						${isToday ? "bg-primary/5 border-primary-light shadow-md" : "border-gray-200 bg-white"}
						${isSelected ? "ring-2 ring-primary-light shadow-lg" : ""}
						${hasReadings ? "hover:shadow-xl hover:border-primary/30" : "hover:shadow-md hover:border-gray-300"}
						hover:scale-[1.01] hover:z-10
					`}
					onClick={() => onDateClick(new Date(year, month, date))}
				>
					{/* 날짜 표시 */}
					<div
						className={`flex items-center justify-between mb-2 ${
							isToday ? "text-primary font-bold" : isWeekend ? "text-red-500" : "text-gray-700"
						}`}
					>
						<span className={`text-sm font-semibold ${isToday ? "text-base" : ""}`}>{date}</span>
						{isToday && (
							<span className='text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-medium'>
								오늘
							</span>
						)}
					</div>

					{/* 독서 기록 표시 */}
					<div className='space-y-1'>
						{dayReadings.slice(0, 2).map((reading, idx) => {
							const colors = getColorForBook(reading.bookId);
							return (
								<div
									key={`${reading.id}-${idx}`}
									className='text-[10px] px-1.5 py-1 rounded-md shadow-sm hover:shadow-md transition-shadow group/item'
									style={{
										backgroundColor: colors.bg,
										borderLeft: `3px solid ${colors.border}`,
									}}
									title={`${reading.bookTitle}\n${reading.memo || ""}`}
								>
									<div className='flex items-center gap-1'>
										{reading.frontCoverImageUrl && (
											<img
												src={reading.frontCoverImageUrl}
												alt=''
												className='w-5 h-6 object-cover rounded shadow-sm'
											/>
										)}
										<span className='truncate font-medium flex-1' style={{ color: colors.text }}>
											📖 {reading.bookTitle}
										</span>
									</div>
								</div>
							);
						})}
						{dayReadings.length > 2 && (
							<div className='text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-center'>
								+{dayReadings.length - 2}권 더
							</div>
						)}
					</div>

					{/* 호버 시 플러스 아이콘 */}
					{!hasReadings && (
						<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 rounded-lg'>
							<span className='text-2xl text-primary-light'>+</span>
						</div>
					)}
				</div>
			);
		}

		return days;
	};

	return (
		<div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
			{/* 헤더 */}
			<div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-100'>
				<div>
					<h2 className='text-2xl font-bold text-primary flex items-center gap-2'>
						<span className='text-2xl'>📚</span>
						{year}년 {month + 1}월
					</h2>
					<p className='text-sm text-gray-500 mt-1'>나의 독서 여정</p>
				</div>
				<div className='flex gap-2'>
					<button
						onClick={handlePrevMonth}
						className='px-4 py-2 bg-gray-50 border border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary rounded-lg transition-all duration-200 font-medium text-gray-600'
					>
						← 이전
					</button>
					<button
						onClick={handleToday}
						className='px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md'
					>
						오늘
					</button>
					<button
						onClick={handleNextMonth}
						className='px-4 py-2 bg-gray-50 border border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary rounded-lg transition-all duration-200 font-medium text-gray-600'
					>
						다음 →
					</button>
				</div>
			</div>

			{/* 달력 그리드 */}
			<div className='grid grid-cols-7 gap-2 p-2 bg-gray-50/50 rounded-lg'>
				{renderCalendarDays()}
			</div>

			{/* 범례 */}
			<div className='mt-6 pt-4 border-t border-gray-100'>
				<div className='flex items-center justify-between'>
					<p className='text-sm text-gray-600 flex items-center gap-2'>
						<span className='text-primary-light'>●</span>
						<span>날짜를 클릭하면 독서 기록을 추가할 수 있습니다</span>
					</p>
					<div className='flex items-center gap-4 text-xs text-gray-500'>
						<div className='flex items-center gap-1.5'>
							<div className='w-3 h-3 bg-primary/10 border border-primary-light rounded'></div>
							<span>오늘</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<div className='w-3 h-3 bg-teal-50 border-l-2 border-primary-light rounded'></div>
							<span>독서 기록</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReadingCalendar;
