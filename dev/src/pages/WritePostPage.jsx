import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communityAPI } from "../lib/api/community";

const WritePostPage = () => {
	const { groupId } = useParams();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!title.trim() || !content.trim()) {
			alert("제목과 내용을 모두 입력해주세요.");
			return;
		}

		setIsSubmitting(true);
		try {
			await communityAPI.createPost(groupId, {
				title: title.trim(),
				content: content.trim(),
			});
			navigate(`/community/${groupId}`);
		} catch (error) {
			console.error("게시글 작성 실패:", error);
			alert("게시글 작성에 실패했습니다. 다시 시도해주세요.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-primary mb-2'>게시글 작성</h1>
				<p className='text-gray-600'>커뮤니티에 새로운 이야기를 공유해보세요</p>
			</div>

			<div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100'>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label htmlFor='title' className='block text-sm font-semibold text-gray-700 mb-2'>
							제목
						</label>
						<input
							type='text'
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
							placeholder='제목을 입력하세요'
							required
						/>
					</div>

					<div>
						<label htmlFor='content' className='block text-sm font-semibold text-gray-700 mb-2'>
							내용
						</label>
						<textarea
							id='content'
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none min-h-[400px]'
							placeholder='내용을 입력하세요'
							required
						/>
					</div>

					<div className='flex justify-end space-x-3 pt-4 border-t border-gray-100'>
						<button
							type='button'
							onClick={() => navigate(`/community/${groupId}`)}
							className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
						>
							취소
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all'
						>
							{isSubmitting ? "작성 중..." : "작성하기"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WritePostPage;
