import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

export function Chat() {
	const [messages, setMessages] = useState([
		{ id: 1, text: 'Apa itu sendang bandung?', sender: 'user' },
		{ id: 2, text: 'Sendang Bandung adalah sebuah desa wisata yang terletak di Desa Karang, Kecamatan Moyudan, Kabupaten Sleman, Daerah Istimewa Yogyakarta...', sender: 'bot' },
	]);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false); // 1. Add loading state

	const chatContainerRef = useRef(null);

	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages, isLoading]); // Scroll when loading starts too

	const handleSubmit = () => {
		const query = inputValue.trim();
		if (query === '' || isLoading) return; // Prevent sending while loading

		const newUserMessage = {
			id: Date.now(),
			text: query,
			sender: 'user',
		};
		setMessages(prevMessages => [...prevMessages, newUserMessage]);
		setInputValue('');
		setIsLoading(true); // 2. Set loading to true before fetching

		fetch('https://api.sendangbandung.com/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query }),
		})
			.then(response => response.json())
			.then(data => {
				const newBotMessage = {
					id: Date.now() + 1,
					text: data.result.response || 'Maaf, saya tidak mengerti pertanyaan Anda.',
					sender: 'bot',
				};
				setMessages(prevMessages => [...prevMessages, newBotMessage]);
			})
			.catch(error => {
				console.error('Error:', error);
				const newBotMessage = {
					id: Date.now() + 1,
					text: 'Terjadi kesalahan saat menghubungi server.',
					sender: 'bot',
				};
				setMessages(prevMessages => [...prevMessages, newBotMessage]);
			})
			.finally(() => {
				setIsLoading(false); // 3. Set loading to false after fetch completes
			});
	};

	const handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSubmit();
		}
	};

	return (
		<div class="flex flex-col shadow-xl gap-[24px] rounded-2xl px-[32px] py-[80px] my-[64px] bg-white">
			<div class="flex items-center justify-center">
				<h2 class="font-bold text-[30px]">Tanya Bot</h2>
			</div>
			<div id="chat" ref={chatContainerRef} class="h-[70vh] overflow-y-scroll p-[24px]">
				{messages.map((msg) => (
					<div key={msg.id} class={`flex flex-row mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
						<p class={`shadow-xl rounded-2xl p-[16px] flex-none max-w-[75%] ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}>
							{msg.text}
						</p>
					</div>
				))}

				{/* 4. Render loading indicator */}
				{isLoading && (
					<div class="flex flex-row mb-4 justify-start">
						<div class="shadow-xl rounded-2xl p-[16px] flex-none bg-gray-200 text-black">
							<div class="flex items-center justify-center gap-2">
								<span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
								<span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
								<span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
							</div>
						</div>
					</div>
				)}
			</div>
			<div class="flex flex-row gap-[16px]">
				<input
					class="text-left shadow-xl rounded-2xl p-[16px] grow ring disabled:opacity-50"
					type="text"
					placeholder="Tanyakan sesuatu..."
					value={inputValue}
					onInput={(e) => setInputValue(e.currentTarget.value)}
					onKeyPress={handleKeyPress}
					disabled={isLoading}
				/>
				<button
					onClick={handleSubmit}
					class="text-right shadow-xl rounded-2xl p-[16px] flex-none bg-primary text-white hover:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isLoading}
				>
					Kirim
				</button>
			</div>
		</div>
	);
}
