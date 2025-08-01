import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

export function Chat() {
	const [messages, setMessages] = useState([
		{ id: 1, text: 'Apa itu sendang bandung?', sender: 'user' },
		{ id: 2, text: 'Sendang Bandung adalah sebuah desa wisata yang terletak di Desa Karang, Kecamatan Moyudan, Kabupaten Sleman, Daerah Istimewa Yogyakarta. Desa wisata ini memiliki potensi besar untuk mengembangkan program yang melibatkan masyarakat lokal, seperti pertunjukan seni budaya, homestay dengan penduduk desa, atau pasar produk-produk UMKM lokal.', sender: 'bot' },
	]);
	const [inputValue, setInputValue] = useState('');

	const chatContainerRef = useRef(null);

	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = () => {
		const query = inputValue.trim();
		if (query === '') return;

		const newUserMessage = {
			id: Date.now(),
			text: query,
			sender: 'user',
		};
		setMessages(prevMessages => [...prevMessages, newUserMessage]);

		setInputValue('');

		fetch('https://api.sendangbandung.com/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query }),
		})
			.then(response => response.json())
			.then(data => {
				console.log('Response from server:', data);
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
				{/* Map over the messages array to render each message */}
				{messages.map((msg) => (
					<div key={msg.id} class="flex flex-row mb-4">
						{msg.sender === 'user' ? (
							<>
								<div class="grow"></div>
								<p class="text-right shadow-xl rounded-2xl p-[16px] flex-none bg-primary text-white max-w-[75%]">{msg.text}</p>
							</>
						) : (
							<>
								<p class="text-left shadow-xl rounded-2xl p-[16px] flex-none bg-gray-200 text-black max-w-[75%]">{msg.text}</p>
								<div class="grow"></div>
							</>
						)}
					</div>
				))}
			</div>
			<div class="flex flex-row gap-[16px]">
				<input
					class="text-left shadow-xl rounded-2xl p-[16px] grow ring"
					type="text"
					id="query"
					name="username"
					placeholder="Tanyakan sesuatu..."
					value={inputValue}
					onInput={(e) => setInputValue(e.currentTarget.value)}
					onKeyPress={handleKeyPress}
				/>
				<button
					id="submit"
					onClick={handleSubmit}
					class="text-right shadow-xl rounded-2xl p-[16px] flex-none bg-primary text-white hover:bg-primary/80 transition-all"
				>
					Kirim
				</button>
			</div>
		</div>
	);
}

