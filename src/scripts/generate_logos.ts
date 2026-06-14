import fs from 'fs';

// Heavily curated list of logos that are symbols/icons (no heavy logs with pure text)
const categories = {
  apps: {
    1: ["YouTube|youtube", "TikTok|tiktok", "Instagram|instagram", "Facebook|facebook", "Snapchat|snapchat", "Discord|discord", "Telegram|telegram", "WhatsApp|whatsapp", "Spotify|spotify", "Netflix|netflix", "Pinterest|pinterest", "LinkedIn|linkedin", "Reddit|reddit", "Twitch|twitch", "Messenger|messenger", "Zoom|zoom", "Chrome|googlechrome", "Safari|safari", "Firefox|firefox", "Apple|apple", "Android|android", "Airbnb|airbnb"],
    2: ["Tinder|tinder", "Waze|waze", "Vimeo|vimeo", "SoundCloud|soundcloud", "Slack|slack", "Notion|notion", "Asana|asana", "Trello|trello", "Figma|figma", "Dropbox|dropbox", "Evernote|evernote", "Strava|strava", "WeChat|wechat", "Line|line", "Signal|signal", "Viber|viber", "Duolingo|duolingo", "Kik|kik", "Tumblr|tumblr", "Skype|skype"],
    3: ["Tripadvisor|tripadvisor", "Yelp|yelp", "Shazam|shazam", "Coursera|coursera", "Udemy|udemy", "Bilibili|bilibili", "Procreate|procreate", "Foursquare|foursquare", "KakaoTalk|kakaotalk", "React|react", "Vue.js|vuedotjs", "Angular|angular", "Git|git", "GitHub|github", "GitLab|gitlab", "Docker|docker", "Kubernetes|kubernetes"]
  },
  tech: {
    1: ["Windows|windows", "macOS|macos", "Linux|linux", "Microsoft|microsoft", "Google|google", "Nvidia|nvidia", "PlayStation|playstation", "Xbox|xbox", "Intel|intel", "AMD|amd", "Huawei|huawei", "Xiaomi|xiaomi", "Bluetooth|bluetooth", "Wi-Fi|wifi"],
    2: ["Ubuntu|ubuntu", "Firebase|firebase", "Supabase|supabase", "MongoDB|mongodb", "Redis|redis", "GraphQL|graphql", "Stripe|stripe", "Atlassian|atlassian", "Twilio|twilio", "Vercel|vercel", "Netlify|netlify", "Ethereum|ethereum", "Bitcoin|bitcoin"],
    3: ["Debian|debian", "CentOS|centos", "Raspberry Pi|raspberrypi", "Arduino|arduino", "Fedora|fedora", "Red Hat|redhat", "SUSE|suse", "Go|go", "Rust|rust", "Ruby|ruby", "PHP|php", "Kotlin|kotlin", "Swift|swift", "Flutter|flutter", "Solana|solana", "Polkadot|polkadot", "Cardano|cardano", "Dogecoin|dogecoin", "Litecoin|litecoin", "Binance|binance", "Kraken|kraken"]
  },
  cars: {
    1: ["BMW|bmw", "Mercedes-Benz|mercedes", "Audi|audi", "Toyota|toyota", "Honda|honda", "Ferrari|ferrari", "Lamborghini|lamborghini", "Porsche|porsche", "Volkswagen|volkswagen", "Chevrolet|chevrolet", "Hyundai|hyundai", "Tesla|tesla"],
    2: ["Mazda|mazda", "Subaru|subaru", "Lexus|lexus", "Mitsubishi|mitsubishi", "Peugeot|peugeot", "Volvo|volvo", "Renault|renault", "Aston Martin|astonmartin", "Bentley|bentley", "Rolls-Royce|rollsroyce", "Maserati|maserati", "Bugatti|bugatti"],
    3: ["McLaren|mclaren", "Land Rover|landrover", "Jaguar|jaguar", "Mini|mini", "Rivian|rivian", "Alfa Romeo|alfaromeo", "Skoda|skoda", "Seat|seat", "Dacia|dacia", "Acura|acura", "Chrysler|chrysler", "Abarth|abarth", "Mahindra|mahindra"]
  },
  food: {
    1: ["McDonald's|mcdonalds", "Starbucks|starbucks", "Pepsi|pepsi", "Domino's|dominos", "Pizza Hut|pizzahut", "Taco Bell|tacobell", "KFC|kfc"],
    2: ["Red Bull|redbull", "Monster Energy|monster", "Gatorade|gatorade", "Pringles|pringles", "Lay's|lays", "Doritos|doritos", "Cheetos|cheetos"],
    3: ["Nescafé|nescafe", "Unilever|unilever", "Danone|danone", "Lipton|lipton", "Nespresso|nespresso", "Lavazza|lavazza", "Panda Express|pandaexpress"]
  },
  games: {
    1: ["Steam|steam", "Epic Games|epicgames", "Riot Games|riotgames", "Rockstar Games|rockstargames", "Nintendo|nintendo", "Ubisoft|ubisoft", "Minecraft|minecraft", "Roblox|roblox"],
    2: ["Valorant|valorant", "League of Legends|leagueoflegends", "Unity|unity", "Unreal Engine|unrealengine", "PUBG|pubg", "Free Fire|freefire", "Bethesda|bethesda", "CD Projekt Red|cdprojekt", "BioWare|bioware"],
    3: ["Naughty Dog|naughtydog", "Bungie|bungie", "Respawn|respawn", "Square Enix|squareenix", "Capcom|capcom", "Konami|konami", "Sega|sega", "Bandai Namco|bandainamco", "Mojang|mojang", "Valve|valve", "Brawl Stars|brawlstars", "Clash Royale|clashroyale", "Clash of Clans|clashofclans"]
  },
  lifestyle: {
    1: ["Nike|nike", "Adidas|adidas", "Puma|puma", "Under Armour|underarmour", "Gucci|gucci", "Louis Vuitton|louisvuitton", "Chanel|chanel", "Rolex|rolex"],
    2: ["Converse|converse", "New Balance|newbalance", "Reebok|reebok", "Versace|versace", "Burberry|burberry", "Ralph Lauren|ralphlauren"],
    3: ["Patagonia|patagonia", "Asics|asics", "Skechers|skechers", "Columbia|columbia", "Salomon|salomon", "Arc'teryx|arcteryx", "Oakley|oakley", "Swatch|swatch", "Omega|omega", "Tag Heuer|tagheuer", "Breitling|breitling"]
  },
  travel: {
    1: ["Uber|uber", "Lyft|lyft", "Airbnb|airbnb", "Delta|delta", "United|united", "Emirates|emirates", "Qatar Airways|qatarairways"],
    2: ["Lufthansa|lufthansa", "British Airways|britishairways", "Skyscanner|skyscanner", "Ryanair|ryanair", "EasyJet|easyjet"],
    3: ["KLM|klm", "Singapore Airlines|singaporeairlines", "Cathay Pacific|cathaypacific", "Qantas|qantas", "Air Canada|aircanada", "Hopper|hopper", "Omio|omio", "FlixBus|flixbus", "Trainline|trainline"]
  }
};

async function generate() {
  let lines = [];
  lines.push(`export type LogoCategory = 'apps' | 'tech' | 'cars' | 'food' | 'games' | 'lifestyle' | 'finance' | 'travel';`);
  lines.push('');
  lines.push(`export interface LogoItem {`);
  lines.push(`  id: string;`);
  lines.push(`  name: string;`);
  lines.push(`  url: string;`);
  lines.push(`  category: LogoCategory;`);
  lines.push(`  difficulty: 1 | 2 | 3;`);
  lines.push(`}`);
  lines.push('');
  lines.push(`export const LOGOS_DATA: LogoItem[] = [`);

  let idCounter = 1;
  const tasks = [];
  
  for (const [category, diffs] of Object.entries(categories)) {
    for (const [diffStr, items] of Object.entries(diffs)) {
      const diff = parseInt(diffStr);
      for (const item of items) {
        const [name, slug] = item.split('|');
        if (!name || !slug) continue;
        
        let url = `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg`;
        
        tasks.push(async () => {
          try {
            const res = await fetch(url);
            if (res.ok) {
              return `  { id: 'logo_${idCounter++}', name: "${name}", url: "${url}", category: '${category}' as LogoCategory, difficulty: ${diff} as 1|2|3 },`;
            } else {
              console.log(`FAILED TO FIND ${name} / ${slug}`);
              return null;
            }
          } catch(e) {
            console.log(`FAILED TO FETCH ${name} / ${slug}`);
            return null;
          }
        });
      }
    }
  }

  const BATCH_SIZE = 10;
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(t => t()));
    for (const r of results) {
      if (r) lines.push(r);
    }
  }

  lines.push(`];`);
  fs.writeFileSync('src/lib/logosData.ts', lines.join('\n'));
  console.log(`Generated ${lines.length - 10} strictly symbol logos successfully.`);
}

generate();
