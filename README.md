# Virtual Arcade Workshop

An interactive 2D arcade workshop where students can showcase their game projects. Built with Phaser.js and Supabase.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase project, go to SQL Editor and run:

```sql
CREATE TABLE arcade_machines (
  id SERIAL PRIMARY KEY,
  machine_number INTEGER UNIQUE NOT NULL,
  game_title TEXT,
  student_name TEXT,
  game_link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE arcade_machines ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your use case)
CREATE POLICY "Enable all access for arcade_machines" ON arcade_machines
  FOR ALL USING (true) WITH CHECK (true);
```

3. Get your Supabase URL and API Key:
   - Go to Project Settings > API
   - Copy the Project URL and the `anon` public API key

4. Create a `config.js` file in the root directory:

```javascript
const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

**Important:** Add `config.js` to `.gitignore` to keep your keys private!

### 3. Run Locally

```bash
npm run dev
```

Then open your browser to `http://localhost:8080`

The dev server includes live-reload, so any changes you make to files will automatically refresh the browser!

### 4. Deploy to Netlify

1. Push your code to GitHub (make sure `config.js` is gitignored!)
2. Go to [netlify.com](https://netlify.com) and create a new site from your repository
3. Add environment variables in Netlify:
   - Go to Site Settings > Environment Variables
   - You can also create a `config.js` file directly in your repo with your keys for public use

## How It Works

- Walk around the arcade workshop using arrow keys or WASD
- Click on arcade machines to view game information
- If a machine is empty, you can add a new game
- Each machine displays game info in an arcade-style interface

## Project Structure

- `index.html` - Main HTML file
- `js/game.js` - Phaser game logic and scenes
- `js/supabase-client.js` - Supabase integration
- `styles/main.css` - Styling
- `config.js` - Supabase configuration (not in git)
