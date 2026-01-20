/**
 * yuruimukun Music Player
 * HLS.js based streaming player with genre filter
 */

(function() {
  'use strict';

  const PLAYLIST = [
  {
    id: 'Danmaku',
    title: 'Danmaku',
    artist: 'yuruimukun',
    genre: 'aki-music',
    description: '弾幕シューティングゲームをイメージした疾走感のあるエレクトロニック曲。高速で飛び交う弾幕のような電子音と、緊張感のあるビートが特徴です。ゲーム中のBGMや、集中力を高めたい作業時に。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/Danmaku/playlist.m3u8',
  },
  {
    id: 'Marron battle',
    title: 'Marron battle',
    artist: 'yuruimukun',
    genre: 'aki-music',
    description: '栗をテーマにした秋らしい戦闘曲。可愛らしさと緊張感が同居する不思議なバランスが特徴。秋の収穫祭のような賑やかさを感じられる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/Marron battle/playlist.m3u8',
  },
  {
    id: 'ninja',
    title: 'ninja',
    artist: 'yuruimukun',
    genre: 'aki-music',
    description: '忍者の静かな足音と素早い動きをイメージした和風エレクトロニック。闇夜を駆け抜けるような疾走感と、息を潜めるような静寂が交互に訪れます。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/ninja/playlist.m3u8',
  },
  {
    id: 'oyasumi',
    title: 'oyasumi',
    artist: 'yuruimukun',
    genre: 'aki-music',
    description: '一日の終わりに聴きたい穏やかな曲。柔らかな音色が心を落ち着かせ、ゆったりとした眠りへと誘います。夜のリラックスタイムにおすすめです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oyasumi/playlist.m3u8',
  },
  {
    id: 'tomoshibi',
    title: 'tomoshibi',
    artist: 'yuruimukun',
    genre: 'aki-music',
    description: '小さな灯火のような温かみのあるメロディ。暗闘の中でほのかに光る希望をイメージした、心に寄り添う優しい一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/tomoshibi/playlist.m3u8',
  },
  {
    id: 'meitantei',
    title: 'meitantei',
    artist: 'yuruimukun',
    genre: 'bgm',
    description: 'ミステリアスな雰囲気漂う探偵風BGM。謎解きの場面や、考え事をしながらの作業に。少しコミカルな要素も含んだ親しみやすい曲調です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/meitantei/playlist.m3u8',
  },
  {
    id: 'nekokan',
    title: 'nekokan',
    artist: 'yuruimukun',
    genre: 'bgm',
    description: '猫の完璧さを表現した曲。のんびりとした猫の日常と、時折見せる俊敏な動きを音楽で表現。猫好きな方に捧げる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/nekokan/playlist.m3u8',
  },
  {
    id: 'battle',
    title: 'battle',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    description: 'ゲームの戦闘シーンを想起させるアップテンポな曲。緊張感のあるビートと盛り上がるメロディで、集中力を高めたい時に最適です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/battle/playlist.m3u8',
  },
  {
    id: 'chirizakura',
    title: 'chirizakura',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    description: '散りゆく桜をテーマにした和風の楽曲。儚くも美しい桜吹雪の情景を、繊細なメロディで表現しています。春の終わりに聴きたい一曲。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/chirizakura/playlist.m3u8',
  },
  {
    id: 'kokokokomebattle',
    title: 'kokokokomebattle',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    description: 'コメバトルの激しさを表現したコミカルかつ熱い戦闘曲。連続する「ココココ」というリズムが印象的。ゲーム実況やテンションを上げたい時に。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/kokokokomebattle/playlist.m3u8',
  },
  {
    id: 'komebattle',
    title: 'komebattle',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    description: 'お米をめぐる壮大なバトルをイメージした曲。日本の主食への敬意を込めた、ユーモラスながらも本格的な戦闘BGMです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/komebattle/playlist.m3u8',
  },
  {
    id: 'odoro-',
    title: 'odoro-',
    artist: 'yuruimukun',
    genre: 'game-bgmfuu',
    description: '「踊ろう」をテーマにした楽しいダンスミュージック。体が自然と動き出すようなリズムで、気分を上げたい時にぴったりです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/odoro-/playlist.m3u8',
  },
  {
    id: 'acid',
    title: 'acid',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: '歪んだギターサウンドが特徴的なアシッドロック風の楽曲。サイケデリックな音の波に身を任せて、非日常的な音楽体験を。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/acid/playlist.m3u8',
  },
  {
    id: 'atsu',
    title: 'atsu',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: '暑い夏の日を思わせる熱いギターサウンド。汗をかきながら弾いているような生々しいエネルギーが伝わる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/atsu/playlist.m3u8',
  },
  {
    id: 'BINGO',
    title: 'BINGO',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: 'ビンゴゲームの興奮とワクワク感を表現したポップなギター曲。当たりが出そうな期待感に満ちたメロディをお楽しみください。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/BINGO/playlist.m3u8',
  },
  {
    id: 'neko car',
    title: 'neko car',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: '猫がドライブしている様子をイメージした軽快なギター曲。窓から入る風と、自由気ままな猫の姿が浮かぶ爽やかなサウンドです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/neko car/playlist.m3u8',
  },
  {
    id: 'sekaizora',
    title: 'sekaizora',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: '世界中の空をつなぐような壮大なギターサウンド。どこまでも広がる青空をイメージした、開放感あふれる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/sekaizora/playlist.m3u8',
  },
  {
    id: 'yuruimukun-beat1',
    title: 'yuruimukun-beat1',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: 'ゆるいむくんらしさ全開のビート曲。ゆるさとかっこよさを両立した独自のグルーヴで、作業用BGMとしても最適です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yuruimukun-beat1/playlist.m3u8',
  },
  {
    id: 'yuruimukun-beat2',
    title: 'yuruimukun-beat2',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: 'yuruimukun-beat1に続く第二弾。より洗練されたビートと、少しメロウな雰囲気が特徴。夕暮れ時の作業にぴったりです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yuruimukun-beat2/playlist.m3u8',
  },
  {
    id: 'travel-manul-nekosan',
    title: 'travel-manul-nekosan',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: 'マヌルネコの旅をテーマにしたギター曲。広大な草原を悠々と歩くマヌルネコの姿が目に浮かぶ、冒険心をくすぐる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/travel-manul-nekosan/playlist.m3u8',
  },
  {
    id: 'negai',
    title: 'negai',
    artist: 'yuruimukun',
    genre: 'guitar',
    description: '空と街をテーマにしたギター曲。都会の空を見上げた時の開放感と、街の喧騒が交差する情景を表現した一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/negai/playlist.m3u8',
  },
  {
    id: 'atawo',
    title: 'atawo',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: 'アコースティックギターの温かみある音色が心地よい一曲。指先から紡ぎ出される素朴なメロディで、穏やかなひとときを。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/atawo/playlist.m3u8',
  },
  {
    id: 'awafuki',
    title: 'awafuki',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: '泡のように軽やかで儚いアコースティック曲。クリーントーンのギターが奏でる透明感のあるサウンドをお楽しみください。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/awafuki/playlist.m3u8',
  },
  {
    id: 'band CatsF',
    title: 'band CatsF',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: '猫たちのバンドをイメージしたアコースティック曲。自由気ままに演奏する猫たちの姿が目に浮かぶ、ほのぼのとした一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/band CatsF/playlist.m3u8',
  },
  {
    id: 'forest session',
    title: 'forest session',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: '森の中でのセッションをイメージしたナチュラルなサウンド。木漏れ日の中で奏でられる穏やかなギターの調べをお楽しみください。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/forest session/playlist.m3u8',
  },
  {
    id: 'sakana',
    title: 'sakana',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: '魚が泳ぐ様子を表現したゆらゆらとしたアコースティック曲。水の中を漂うような心地よさで、リラックスタイムにおすすめです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/sakana/playlist.m3u8',
  },
  {
    id: 'SUNMA',
    title: 'SUNMA',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: '秋刀魚への愛を込めたアコースティック曲。秋の味覚を思い出しながら聴きたい、どこか懐かしい温かみのある一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/SUNMA/playlist.m3u8',
  },
  {
    id: 'yabimi',
    title: 'yabimi',
    artist: 'yuruimukun',
    genre: 'guitar-aco or clean',
    description: '夜の美しさをテーマにしたクリーンギター曲。静かな夜に一人で聴きたくなるような、繊細で美しいメロディです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yabimi/playlist.m3u8',
  },
  {
    id: 'halloween-manul neko',
    title: 'halloween-manul neko',
    artist: 'yuruimukun',
    genre: 'halloween',
    description: 'ハロウィンとマヌルネコをテーマにした曲。ちょっと不気味だけど可愛らしい、ハロウィンの夜にぴったりの雰囲気です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/halloween-manul neko/playlist.m3u8',
  },
  {
    id: 'halloween-okataduke',
    title: 'halloween-okataduke',
    artist: 'yuruimukun',
    genre: 'halloween',
    description: 'ハロウィンが終わった後のお片付けをイメージ。少し寂しげだけど前向きな気持ちになれる、季節の変わり目の一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/halloween-okataduke/playlist.m3u8',
  },
  {
    id: 'MIKAN NEKOSAN',
    title: 'MIKAN NEKOSAN',
    artist: 'yuruimukun',
    genre: 'halloween',
    description: 'みかんと猫さんをテーマにしたハロウィン曲。オレンジ色の暖かみと猫の気まぐれさが織りなす不思議な世界観をお楽しみください。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/MIKAN NEKOSAN/playlist.m3u8',
  },
  {
    id: 'kelt',
    title: 'kelt',
    artist: 'yuruimukun',
    genre: 'kelt',
    description: 'ケルト音楽をベースにしたファンタジックな一曲。緑の丘と古い伝説を思わせる、どこか懐かしい異国の音楽体験を。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/kelt/playlist.m3u8',
  },
  {
    id: 'ie-cafe',
    title: 'ie-cafe',
    artist: 'yuruimukun',
    genre: 'lofi',
    description: '家でカフェ気分を味わえるLo-Fi曲。コーヒーの香りと午後の光を感じながら、ゆったりとした時間を過ごせます。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/ie-cafe/playlist.m3u8',
  },
  {
    id: 'neko-cafe',
    title: 'neko-cafe',
    artist: 'yuruimukun',
    genre: 'lofi',
    description: '猫カフェにいるような癒しのLo-Fi曲。猫たちに囲まれてくつろぐ幸せな時間をイメージした、心温まるサウンドです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/neko-cafe/playlist.m3u8',
  },
  {
    id: 'oyasumi',
    title: 'oyasumi',
    artist: 'yuruimukun',
    genre: 'lofi',
    description: '一日の終わりに聴きたい穏やかな曲。柔らかな音色が心を落ち着かせ、ゆったりとした眠りへと誘います。夜のリラックスタイムにおすすめです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oyasumi/playlist.m3u8',
  },
  {
    id: 'tomoshibi',
    title: 'tomoshibi',
    artist: 'yuruimukun',
    genre: 'lofi',
    description: '小さな灯火のような温かみのあるメロディ。暗闘の中でほのかに光る希望をイメージした、心に寄り添う優しい一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/tomoshibi/playlist.m3u8',
  },
  {
    id: 'umi-cafe',
    title: 'umi-cafe',
    artist: 'yuruimukun',
    genre: 'lofi',
    description: '海辺のカフェをイメージしたLo-Fi曲。波の音と潮風を感じながら、リゾート気分でリラックスできる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/umi-cafe/playlist.m3u8',
  },
  {
    id: 'reverth going back',
    title: 'reverth going back',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: 'ケルトとLo-Fiを融合させた曲。過去への郷愁と前へ進む決意が交差する、感傷的でありながら前向きな楽曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/reverth going back/playlist.m3u8',
  },
  {
    id: 'revolutionary event',
    title: 'revolutionary event',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: '革命的な出来事をテーマにしたケルト風Lo-Fi。日常の中の小さな革命を祝うような、心躍るメロディをお楽しみください。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/revolutionary event/playlist.m3u8',
  },
  {
    id: 'runing culture',
    title: 'runing culture',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: '走り続ける文化をイメージしたケルト風Lo-Fi。伝統を守りながらも進化し続ける力強さを感じられる一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/runing culture/playlist.m3u8',
  },
  {
    id: 'second of the world',
    title: 'second of the world',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: '世界の二番目をテーマにした曲。一番ではないけれど大切な存在への賛歌。ケルトとLo-Fiの心地よい融合を堪能できます。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/second of the world/playlist.m3u8',
  },
  {
    id: 'yugudorasiru-1',
    title: 'yugudorasiru-1',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: 'ユグドラシルをテーマにしたケルト風Lo-Fiシリーズ第一弾。世界樹の根元で聴くような神秘的な雰囲気を感じてください。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yugudorasiru-1/playlist.m3u8',
  },
  {
    id: 'yugudorasiru-2',
    title: 'yugudorasiru-2',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: 'ユグドラシルシリーズ第二弾。世界樹の幹を登るような展開で、徐々に視界が開けていく感覚を音楽で表現しています。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yugudorasiru-2/playlist.m3u8',
  },
  {
    id: 'yugudorasiru-3',
    title: 'yugudorasiru-3',
    artist: 'yuruimukun',
    genre: 'lofi-kelt',
    description: 'ユグドラシルシリーズ完結編。世界樹の頂上から見渡す景色をイメージした、壮大でありながら穏やかなサウンドです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yugudorasiru-3/playlist.m3u8',
  },
  {
    id: 'picnic',
    title: 'picnic',
    artist: 'yuruimukun',
    genre: 'natsu-music',
    description: '晴れた日のピクニックをイメージした爽やかな夏曲。青空の下でお弁当を広げる幸せな瞬間を音楽にしました。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/picnic/playlist.m3u8',
  },
  {
    id: 'sakana',
    title: 'sakana',
    artist: 'yuruimukun',
    genre: 'natsu-music',
    description: '魚が泳ぐ様子を表現したゆらゆらとしたアコースティック曲。水の中を漂うような心地よさで、リラックスタイムにおすすめです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/sakana/playlist.m3u8',
  },
  {
    id: 'manji',
    title: 'manji',
    artist: 'yuruimukun',
    genre: 'uta',
    description: '卍をテーマにした歌もの。東洋の神秘と現代的なサウンドが融合した、独特の世界観を持つボーカル曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/manji/playlist.m3u8',
  },
  {
    id: 'nekosan wa sugoi-uta',
    title: 'nekosan wa sugoi-uta',
    artist: 'yuruimukun',
    genre: 'uta',
    description: '猫さんのすごさを歌った曲。猫の魅力を余すことなく表現した、猫好き必聴のユーモラスで愛らしい歌ものです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/nekosan wa sugoi-uta/playlist.m3u8',
  },
  {
    id: 'mujun-sanka',
    title: 'mujun-sanka',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    description: '矛盾をテーマにしたボカロ曲。相反するものが共存する世界を歌った、哲学的でありながらキャッチーな一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/mujun-sanka/playlist.m3u8',
  },
  {
    id: 'onnrei',
    title: 'onnrei',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    description: '音霊をテーマにしたボカロ曲。言葉に宿る魂と、音楽の持つ力を表現した神秘的な楽曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/onnrei/playlist.m3u8',
  },
  {
    id: 'oumagadoki',
    title: 'oumagadoki',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    description: '逢魔が時をテーマにしたボカロ曲。夕暮れ時の不思議な空気感と、現実と幻想の境界を描いた妖しい一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/oumagadoki/playlist.m3u8',
  },
  {
    id: 'owatte-hajimatte',
    title: 'owatte-hajimatte',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    description: '終わりと始まりをテーマにしたボカロ曲。何かが終わることは新しい何かの始まり。前向きなメッセージを込めた楽曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/owatte-hajimatte/playlist.m3u8',
  },
  {
    id: 'wasure-oto',
    title: 'wasure-oto',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    description: '忘れられた音をテーマにしたボカロ曲。記憶の片隅に残る音の断片を集めたような、ノスタルジックで切ない一曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/wasure-oto/playlist.m3u8',
  },
  {
    id: 'yoku',
    title: 'yoku',
    artist: 'yuruimukun',
    genre: 'vocaloid',
    description: '欲をテーマにしたボカロ曲。人間の持つ欲望と向き合い、その本質を問いかける深いメッセージ性を持った楽曲です。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/yoku/playlist.m3u8',
  },
  {
    id: 'antinomy day',
    title: 'antinomy day',
    artist: 'yuruimukun',
    genre: 'wa',
    description: '二律背反をテーマにした和風曲。相反する二つの真理が共存する日を描いた、哲学的で美しい和風サウンドです。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/antinomy day/playlist.m3u8',
  },
  {
    id: 'chirizakura',
    title: 'chirizakura',
    artist: 'yuruimukun',
    genre: 'wa',
    description: '散りゆく桜をテーマにした和風の楽曲。儚くも美しい桜吹雪の情景を、繊細なメロディで表現しています。春の終わりに聴きたい一曲。',
    src: 'https://pub-d7bcb1d667eb4d02a8c23a3291df3129.r2.dev/chirizakura/playlist.m3u8',
  },
];

  // Single track mode for individual track pages
  if (window.SINGLE_TRACK) {
    PLAYLIST.length = 0;
    PLAYLIST.push(window.SINGLE_TRACK);
  }

  const state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0,
    volume: 1,
    isMuted: false,
    shuffleOrder: [],
    hls: null,
    currentGenre: 'all',
    filteredPlaylist: [],
    isGenreExpanded: false,
    hasCountedPlay: false
  };

  const elements = {
    audio: document.getElementById('audioPlayer'),
    albumArt: document.getElementById('albumArt'),
    trackTitle: document.getElementById('trackTitle'),
    trackArtist: document.getElementById('trackArtist'),
    trackDescription: document.getElementById('trackDescription'),
    timeCurrent: document.getElementById('timeCurrent'),
    timeTotal: document.getElementById('timeTotal'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressHandle: document.getElementById('progressHandle'),
    playBtn: document.getElementById('playBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    volumeBtn: document.getElementById('volumeBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeFill: document.getElementById('volumeFill'),
    volumeHandle: document.getElementById('volumeHandle'),
    playlist: document.getElementById('playlist'),
    genreFilter: document.getElementById('genreFilter'),
    playShuffleBtn: document.getElementById('playShuffleBtn'),
    playOrderBtn: document.getElementById('playOrderBtn')
  };

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function shuffleArray(array) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  function getGenres() {
    var genres = [];
    PLAYLIST.forEach(function(track) {
      if (track.genre && genres.indexOf(track.genre) === -1) {
        genres.push(track.genre);
      }
    });
    genres.sort();
    return ['all'].concat(genres);
  }

  function filterPlaylist(genre) {
    if (genre === 'all') {
      state.filteredPlaylist = PLAYLIST.slice();
    } else {
      state.filteredPlaylist = PLAYLIST.filter(function(track) {
        return track.genre === genre;
      });
    }
  }

  function getOriginalIndex(filteredIndex) {
    if (filteredIndex < 0 || filteredIndex >= state.filteredPlaylist.length) return -1;
    var track = state.filteredPlaylist[filteredIndex];
    for (var i = 0; i < PLAYLIST.length; i++) {
      if (PLAYLIST[i].id === track.id) return i;
    }
    return -1;
  }

  function getFilteredIndex(originalIndex) {
    if (originalIndex < 0 || originalIndex >= PLAYLIST.length) return -1;
    var track = PLAYLIST[originalIndex];
    for (var i = 0; i < state.filteredPlaylist.length; i++) {
      if (state.filteredPlaylist[i].id === track.id) return i;
    }
    return -1;
  }

  function updateGenreFilter() {
    if (!elements.genreFilter) return;
    elements.genreFilter.innerHTML = '';
    var genres = getGenres();

    // Header with All button and toggle button
    var header = document.createElement('div');
    header.className = 'genre-filter-header';

    // All button
    var allBtn = document.createElement('button');
    allBtn.className = 'genre-btn';
    allBtn.textContent = 'All';
    allBtn.dataset.genre = 'all';
    if (state.currentGenre === 'all') allBtn.classList.add('active');
    allBtn.addEventListener('click', function() { setGenre('all'); });
    header.appendChild(allBtn);

    // Toggle button (only if there are other genres)
    if (genres.length > 1) {
      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'genre-toggle-btn';
      if (state.isGenreExpanded) toggleBtn.classList.add('expanded');
      toggleBtn.innerHTML = '<span class="toggle-arrow">▼</span> ' +
        (state.isGenreExpanded ? '閉じる' : 'ジャンル選択');
      toggleBtn.addEventListener('click', toggleGenreList);
      header.appendChild(toggleBtn);
    }

    elements.genreFilter.appendChild(header);

    // Genre list (collapsible)
    if (genres.length > 1) {
      var genreList = document.createElement('div');
      genreList.className = 'genre-list';
      genreList.id = 'genreList';
      if (state.isGenreExpanded) genreList.classList.add('expanded');

      // Vocal genres (hardcoded)
      var vocalGenres = ['uta', 'vocaloid'];

      // Separate instrument and vocal genres
      var instGenres = [];
      var vocalList = [];
      genres.forEach(function(genre) {
        if (genre === 'all') return;
        if (vocalGenres.indexOf(genre) >= 0) {
          vocalList.push(genre);
        } else {
          instGenres.push(genre);
        }
      });

      // Instrument section
      if (instGenres.length > 0) {
        var instSection = document.createElement('div');
        instSection.className = 'genre-section';

        var instHeader = document.createElement('div');
        instHeader.className = 'genre-section-header';
        instHeader.textContent = 'インスト';
        instSection.appendChild(instHeader);

        var instButtons = document.createElement('div');
        instButtons.className = 'genre-section-buttons';
        instGenres.forEach(function(genre) {
          var btn = document.createElement('button');
          btn.className = 'genre-btn';
          btn.textContent = genre;
          btn.dataset.genre = genre;
          if (genre === state.currentGenre) btn.classList.add('active');
          btn.addEventListener('click', function() { setGenre(genre); });
          instButtons.appendChild(btn);
        });
        instSection.appendChild(instButtons);
        genreList.appendChild(instSection);
      }

      // Vocal section
      if (vocalList.length > 0) {
        var vocalSection = document.createElement('div');
        vocalSection.className = 'genre-section genre-section-vocal';

        var vocalHeader = document.createElement('div');
        vocalHeader.className = 'genre-section-header';
        vocalHeader.textContent = '歌もの';
        vocalSection.appendChild(vocalHeader);

        var vocalButtons = document.createElement('div');
        vocalButtons.className = 'genre-section-buttons';
        vocalList.forEach(function(genre) {
          var btn = document.createElement('button');
          btn.className = 'genre-btn genre-btn-vocal';
          btn.textContent = genre;
          btn.dataset.genre = genre;
          if (genre === state.currentGenre) btn.classList.add('active');
          btn.addEventListener('click', function() { setGenre(genre); });
          vocalButtons.appendChild(btn);
        });
        vocalSection.appendChild(vocalButtons);
        genreList.appendChild(vocalSection);
      }

      elements.genreFilter.appendChild(genreList);
    }
  }

  function toggleGenreList() {
    state.isGenreExpanded = !state.isGenreExpanded;
    var genreList = document.getElementById('genreList');
    var toggleBtn = elements.genreFilter.querySelector('.genre-toggle-btn');

    if (genreList) {
      genreList.classList.toggle('expanded', state.isGenreExpanded);
    }
    if (toggleBtn) {
      toggleBtn.classList.toggle('expanded', state.isGenreExpanded);
      toggleBtn.innerHTML = '<span class="toggle-arrow">▼</span> ' +
        (state.isGenreExpanded ? '閉じる' : 'ジャンル選択');
    }
  }

  function setGenre(genre) {
    state.currentGenre = genre;
    filterPlaylist(genre);
    updateGenreFilter();
    updatePlaylistUI();
  }

  function generateShuffleOrder() {
    var indices = [];
    for (var i = 0; i < state.filteredPlaylist.length; i++) indices.push(i);
    state.shuffleOrder = shuffleArray(indices);
    var currentFilteredIndex = getFilteredIndex(state.currentIndex);
    if (currentFilteredIndex >= 0) {
      var pos = state.shuffleOrder.indexOf(currentFilteredIndex);
      if (pos > 0) {
        state.shuffleOrder.splice(pos, 1);
        state.shuffleOrder.unshift(currentFilteredIndex);
      }
    }
  }

  function sendPlayCount(trackId) {
    if (!trackId) return;
    // Firebase経由で再生カウントを送信
    if (typeof window.firebasePlayCount === 'function') {
      window.firebasePlayCount(trackId);
    }
  }

  function initHLS(src) {
    if (state.hls) {
      state.hls.destroy();
      state.hls = null;
    }
    if (Hls.isSupported()) {
      state.hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5
      });
      state.hls.loadSource(src);
      state.hls.attachMedia(elements.audio);
      state.hls.on(Hls.Events.MANIFEST_PARSED, function() {
        if (state.isPlaying) elements.audio.play();
      });
      state.hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) state.hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) state.hls.recoverMediaError();
          else state.hls.destroy();
        }
      });
    } else if (elements.audio.canPlayType('application/vnd.apple.mpegurl')) {
      elements.audio.src = src;
    }
  }

  function loadTrack(index, autoPlay) {
    if (index < 0 || index >= PLAYLIST.length) return;
    state.currentIndex = index;
    state.hasCountedPlay = false;
    var track = PLAYLIST[index];
    elements.trackTitle.textContent = track.title;
    elements.trackArtist.textContent = track.artist;
    elements.trackDescription.textContent = track.description || '';
    elements.timeCurrent.textContent = '0:00';
    elements.timeTotal.textContent = formatTime(track.duration);
    elements.progressFill.style.width = '0%';
    elements.progressHandle.style.left = '0%';
    updatePlaylistUI();
    initHLS(track.src);
    if (autoPlay) play();
  }

  function play() {
    if (PLAYLIST.length === 0) return;
    elements.audio.play().then(function() {
      state.isPlaying = true;
      updatePlayButton();
      updatePlaylistUI();
      // Send play count (only once per track)
      if (!state.hasCountedPlay) {
        state.hasCountedPlay = true;
        var track = PLAYLIST[state.currentIndex];
        if (track) sendPlayCount(track.id);
      }
    }).catch(function() {
      state.isPlaying = false;
      updatePlayButton();
    });
  }

  function pause() {
    elements.audio.pause();
    state.isPlaying = false;
    updatePlayButton();
    updatePlaylistUI();
  }

  function togglePlay() {
    if (state.isPlaying) pause();
    else play();
  }

  function playNext() {
    if (state.repeatMode === 2) {
      elements.audio.currentTime = 0;
      play();
      return;
    }
    var currentFilteredIndex = getFilteredIndex(state.currentIndex);
    var nextFilteredIndex;
    if (state.isShuffle) {
      var pos = state.shuffleOrder.indexOf(currentFilteredIndex);
      if (pos < state.shuffleOrder.length - 1) {
        nextFilteredIndex = state.shuffleOrder[pos + 1];
      } else if (state.repeatMode === 1) {
        generateShuffleOrder();
        nextFilteredIndex = state.shuffleOrder[0];
      } else {
        pause();
        return;
      }
    } else {
      if (currentFilteredIndex < state.filteredPlaylist.length - 1) {
        nextFilteredIndex = currentFilteredIndex + 1;
      } else if (state.repeatMode === 1) {
        nextFilteredIndex = 0;
      } else {
        pause();
        return;
      }
    }
    var nextOriginalIndex = getOriginalIndex(nextFilteredIndex);
    if (nextOriginalIndex >= 0) loadTrack(nextOriginalIndex, true);
  }

  function playPrev() {
    if (elements.audio.currentTime > 3) {
      elements.audio.currentTime = 0;
      return;
    }
    var currentFilteredIndex = getFilteredIndex(state.currentIndex);
    var prevFilteredIndex;
    if (state.isShuffle) {
      var pos = state.shuffleOrder.indexOf(currentFilteredIndex);
      prevFilteredIndex = pos > 0 ? state.shuffleOrder[pos - 1] : currentFilteredIndex;
    } else {
      prevFilteredIndex = currentFilteredIndex > 0 ? currentFilteredIndex - 1 : 0;
    }
    var prevOriginalIndex = getOriginalIndex(prevFilteredIndex);
    if (prevOriginalIndex >= 0) loadTrack(prevOriginalIndex, true);
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    elements.shuffleBtn.classList.toggle('active', state.isShuffle);
    if (state.isShuffle) generateShuffleOrder();
  }

  function toggleRepeat() {
    state.repeatMode = (state.repeatMode + 1) % 3;
    elements.repeatBtn.classList.remove('active', 'repeat-one');
    if (state.repeatMode === 1) elements.repeatBtn.classList.add('active');
    else if (state.repeatMode === 2) elements.repeatBtn.classList.add('active', 'repeat-one');
  }

  function setVolume(value) {
    state.volume = Math.max(0, Math.min(1, value));
    elements.audio.volume = state.isMuted ? 0 : state.volume;
    var percent = state.volume * 100;
    elements.volumeFill.style.width = percent + '%';
    elements.volumeHandle.style.left = percent + '%';
    if (state.volume > 0 && state.isMuted) {
      state.isMuted = false;
      updateVolumeIcon();
    }
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    elements.audio.volume = state.isMuted ? 0 : state.volume;
    updateVolumeIcon();
  }

  function seek(percent) {
    var duration = elements.audio.duration;
    if (!isNaN(duration) && isFinite(duration)) {
      elements.audio.currentTime = duration * percent;
    }
  }

  function playShuffled() {
    if (state.filteredPlaylist.length === 0) return;
    state.isShuffle = true;
    elements.shuffleBtn.classList.add('active');
    var indices = [];
    for (var i = 0; i < state.filteredPlaylist.length; i++) indices.push(i);
    state.shuffleOrder = shuffleArray(indices);
    var firstOriginalIndex = getOriginalIndex(state.shuffleOrder[0]);
    if (firstOriginalIndex >= 0) loadTrack(firstOriginalIndex, true);
  }

  function playInOrder() {
    if (state.filteredPlaylist.length === 0) return;
    state.isShuffle = false;
    elements.shuffleBtn.classList.remove('active');
    var firstOriginalIndex = getOriginalIndex(0);
    if (firstOriginalIndex >= 0) loadTrack(firstOriginalIndex, true);
  }

  function updatePlayButton() {
    var iconPlay = elements.playBtn.querySelector('.icon-play');
    var iconPause = elements.playBtn.querySelector('.icon-pause');
    if (state.isPlaying) {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    } else {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    }
  }

  function updateVolumeIcon() {
    var iconVolume = elements.volumeBtn.querySelector('.icon-volume');
    var iconMute = elements.volumeBtn.querySelector('.icon-mute');
    if (state.isMuted || state.volume === 0) {
      iconVolume.style.display = 'none';
      iconMute.style.display = 'block';
    } else {
      iconVolume.style.display = 'block';
      iconMute.style.display = 'none';
    }
  }

  function updateProgress() {
    var current = elements.audio.currentTime;
    var duration = elements.audio.duration;
    if (isNaN(duration) || !isFinite(duration)) return;
    var percent = (current / duration) * 100;
    elements.progressFill.style.width = percent + '%';
    elements.progressHandle.style.left = percent + '%';
    elements.timeCurrent.textContent = formatTime(current);
    elements.timeTotal.textContent = formatTime(duration);
  }

  function updatePlaylistUI() {
    elements.playlist.innerHTML = '';
    state.filteredPlaylist.forEach(function(track, filteredIndex) {
      var originalIndex = getOriginalIndex(filteredIndex);
      var li = document.createElement('li');
      li.className = 'playlist-item';
      if (originalIndex === state.currentIndex) {
        li.classList.add('active');
        if (state.isPlaying) li.classList.add('playing');
      }
      var icon = document.createElement('div');
      icon.className = 'playlist-item-icon';
      if (originalIndex === state.currentIndex && state.isPlaying) {
        var indicator = document.createElement('div');
        indicator.className = 'playing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        icon.appendChild(indicator);
      } else {
        icon.textContent = filteredIndex + 1;
      }
      var info = document.createElement('div');
      info.className = 'playlist-item-info';
      var title = document.createElement('div');
      title.className = 'playlist-item-title';
      title.textContent = track.title;
      info.appendChild(title);
      var duration = document.createElement('span');
      duration.className = 'playlist-item-duration';
      duration.textContent = track.duration ? formatTime(track.duration) : '';
      li.appendChild(icon);
      li.appendChild(info);
      li.appendChild(duration);
      li.addEventListener('click', function() {
        if (originalIndex === state.currentIndex) togglePlay();
        else loadTrack(originalIndex, true);
      });
      elements.playlist.appendChild(li);
    });
  }

  function setupEventListeners() {
    elements.playBtn.addEventListener('click', togglePlay);
    elements.prevBtn.addEventListener('click', playPrev);
    elements.nextBtn.addEventListener('click', playNext);
    elements.shuffleBtn.addEventListener('click', toggleShuffle);
    elements.repeatBtn.addEventListener('click', toggleRepeat);
    elements.volumeBtn.addEventListener('click', toggleMute);
    if (elements.playShuffleBtn) elements.playShuffleBtn.addEventListener('click', playShuffled);
    if (elements.playOrderBtn) elements.playOrderBtn.addEventListener('click', playInOrder);

    var isDraggingProgress = false;
    function handleProgressDrag(e) {
      var rect = elements.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    elements.progressBar.addEventListener('mousedown', function(e) {
      isDraggingProgress = true;
      handleProgressDrag(e);
    });
    document.addEventListener('mousemove', function(e) {
      if (isDraggingProgress) handleProgressDrag(e);
    });
    document.addEventListener('mouseup', function() {
      isDraggingProgress = false;
    });
    elements.progressBar.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      var rect = elements.progressBar.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)));
    });

    var isDraggingVolume = false;
    function handleVolumeDrag(e) {
      var rect = elements.volumeSlider.getBoundingClientRect();
      setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    elements.volumeSlider.addEventListener('mousedown', function(e) {
      isDraggingVolume = true;
      handleVolumeDrag(e);
    });
    document.addEventListener('mousemove', function(e) {
      if (isDraggingVolume) handleVolumeDrag(e);
    });
    document.addEventListener('mouseup', function() {
      isDraggingVolume = false;
    });

    elements.audio.addEventListener('timeupdate', updateProgress);
    elements.audio.addEventListener('ended', playNext);
    elements.audio.addEventListener('loadedmetadata', function() {
      elements.timeTotal.textContent = formatTime(elements.audio.duration);
      if (PLAYLIST[state.currentIndex]) {
        PLAYLIST[state.currentIndex].duration = elements.audio.duration;
        updatePlaylistUI();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); if (e.shiftKey) playPrev(); else seek((elements.audio.currentTime - 5) / elements.audio.duration); break;
        case 'ArrowRight': e.preventDefault(); if (e.shiftKey) playNext(); else seek((elements.audio.currentTime + 5) / elements.audio.duration); break;
        case 'ArrowUp': e.preventDefault(); setVolume(state.volume + 0.1); break;
        case 'ArrowDown': e.preventDefault(); setVolume(state.volume - 0.1); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
      }
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }

  function init() {
    if (PLAYLIST.length === 0) {
      elements.trackTitle.textContent = 'No tracks';
      return;
    }
    filterPlaylist('all');
    updateGenreFilter();
    setVolume(1);
    updateVolumeIcon();
    updatePlaylistUI();
    setupEventListeners();
    loadTrack(0, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
