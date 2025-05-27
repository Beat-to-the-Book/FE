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
		<div className='container mx-auto px-4 py-8'>
			<div className='max-w-3xl mx-auto'>
				<h1 className='text-2xl font-bold mb-6'>게시글 작성</h1>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-1'>
							제목
						</label>
						<input
							type='text'
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
							placeholder='제목을 입력하세요'
							required
						/>
					</div>

					<div>
						<label htmlFor='content' className='block text-sm font-medium text-gray-700 mb-1'>
							내용
						</label>
						<textarea
							id='content'
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[300px]'
							placeholder='내용을 입력하세요'
							required
						/>
					</div>

					<div className='flex justify-end space-x-3'>
						<button
							type='button'
							onClick={() => navigate(`/community/${groupId}`)}
							className='px-4 py-2 text-gray-600 hover:text-gray-800'
						>
							취소
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50'
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
