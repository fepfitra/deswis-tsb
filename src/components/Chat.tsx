import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

export function Chat() {
	const [messages, setMessages] = useState([
		{ id: 1, text: 'Halo! Ada yang bisa saya bantu seputar Desa Wisata Taman Sendang Bandung?', sender: 'bot' },
	]);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	const handleSubmit = () => {
		const query = inputValue.trim();
		if (query === '' || isLoading) return;

		const newUserMessage = { id: Date.now(), text: query, sender: 'user' };
		setMessages(prevMessages => [...prevMessages, newUserMessage]);
		setInputValue('');
		setIsLoading(true);

		fetch('https://api.sendangbandung.com/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query }),
		})
			.then(response => response.json())
			.then(data => {
				const newBotMessage = { id: Date.now() + 1, text: data.result.response || 'Maaf, saya tidak dapat memproses permintaan Anda.', sender: 'bot' };
				setMessages(prevMessages => [...prevMessages, newBotMessage]);
			})
			.catch(error => {
				console.error('Chat API Error:', error);
				const errorBotMessage = { id: Date.now() + 1, text: 'Terjadi kesalahan. Silakan coba lagi nanti.', sender: 'bot' };
				setMessages(prevMessages => [...prevMessages, errorBotMessage]);
			})
			.finally(() => setIsLoading(false));
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !isLoading) {
			event.preventDefault();
			handleSubmit();
		}
	};

	return (
		<section id="chat-bot" class="w-full container mx-auto px-4 md:px-8 py-16 md:py-24">
			<div class="flex flex-col bg-white rounded-2xl shadow-2xl max-w-3xl mx-auto overflow-hidden">
				<div class="p-6 border-b text-center bg-gray-50">
					<h2 class="text-2xl font-bold">Tanya Bot Sendang</h2>
					<p class="text-gray-600 mt-1">Dapatkan jawaban cepat seputar desa wisata kami!</p>
				</div>

				<div ref={chatContainerRef} class="h-96 overflow-y-auto p-6 flex flex-col gap-4">
					{messages.map((msg) => (
						<div key={msg.id} class={`flex items-end gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
							{/* Bot Avatar */}
							{msg.sender === 'bot' && (
								<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xl flex-shrink-0">🌿</div>
							)}

							{/* Message Bubble */}
							<p class={`rounded-2xl p-4 text-white ${msg.sender === 'user'
								? 'bg-primary rounded-br-none'
								: 'bg-gray-200 !text-gray-800 rounded-bl-none'
								}`}>
								{msg.text}
							</p>

							{/* User Avatar */}
							{msg.sender === 'user' && (
								<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xl flex-shrink-0">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
								</div>
							)}
						</div>
					))}

					{isLoading && (
						<div class="flex items-end gap-3 self-start">
							<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xl flex-shrink-0">🌿</div>
							<div class="rounded-2xl p-4 bg-gray-200">
								<div class="flex items-center justify-center gap-2">
									<span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
									<span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
									<span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
								</div>
							</div>
						</div>
					)}
				</div>

				<div class="p-4 border-t flex gap-4 bg-gray-50">
					<input
						class="w-full p-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
						type="text"
						placeholder="Tulis pertanyaan Anda..."
						value={inputValue}
						onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
						onKeyPress={handleKeyPress}
						disabled={isLoading}
					/>
					<button
						onClick={handleSubmit}
						class="btn !rounded-full !p-4 flex-shrink-0 bg-primary"
						disabled={isLoading}
						aria-label="Kirim Pesan"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
					</button>
				</div>
			</div>
		</section>
	);
}
