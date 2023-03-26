import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, PUBLIC_BASE_URL } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

const userStore = writable();

supabase.auth.getSession().then(({ data }) => {
	userStore.set(data.session?.user);
});

supabase.auth.onAuthStateChange((event, session) => {
	if (event == 'SIGNED_IN' && session) {
		userStore.set(session.user);
	} else if (event == 'SIGNED_OUT') {
		userStore.set(null);
	}
});

export default {
	get user() {
		return userStore;
	},
	signUp(email: string, password: string) {
		return supabase.auth.signUp({
			email: email,
			password: password
		});
	},
	async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
	},
	signOut() {
		return supabase.auth.signOut();
	},
	bookmarks: {
		async all() {
			const { data } = await supabase.from('bookmarks').select('*');

			return data;
		},

		async create(bookmark) {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			const { data, error } = await supabase.from('bookmarks').insert({
				...bookmark,
				user_id: user.id
			});

			return data;
		}
	},
	parse: {
		async parseUrl(url: string) {
			const { data, error } = await supabase.functions.invoke('parse', {
				body: { url }
			});

			console.log(data);
			console.log(error);
		}
	}
};
curl --request POST 'http://localhost:43211/functions/v1/parse' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
  --header 'Content-Type: application/json' \
  --data '{ "url":"https://blog.hireproof.io/big-twitch-energy-how-live-streaming-made-me-a-better-developer-ae61e09c8c48" }'