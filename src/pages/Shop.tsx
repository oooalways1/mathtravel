import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import type { CharacterItem } from '../types';

const Shop = () => {
  const navigate = useNavigate();
  const profile = useGameStore((state) => state.profile);
  const purchaseItem = useGameStore((state) => state.purchaseItem);
  const equipItem = useGameStore((state) => state.equipItem);
  
  const [selectedCategory, setSelectedCategory] = useState<'hat' | 'clothes' | 'accessory' | 'character'>('hat');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CharacterItem | null>(null);

  if (!profile) return null;

  // 상점 아이템 목록
  const shopItems: CharacterItem[] = [
    // 모자
    { id: 'hat_1', type: 'hat', name: '왕관', image: '👑', price: 100, owned: false, equipped: false },
    { id: 'hat_2', type: 'hat', name: '마법사 모자', image: '🎩', price: 150, owned: false, equipped: false },
    { id: 'hat_3', type: 'hat', name: '졸업 모자', image: '🎓', price: 200, owned: false, equipped: false },
    { id: 'hat_4', type: 'hat', name: '파티 모자', image: '🎉', price: 120, owned: false, equipped: false },
    { id: 'hat_5', type: 'hat', name: '용기사 투구', image: '🪖', price: 350, owned: false, equipped: false },
    { id: 'hat_6', type: 'hat', name: '해적 모자', image: '🏴‍☠️', price: 280, owned: false, equipped: false },
    
    // 의상
    { id: 'clothes_1', type: 'clothes', name: '슈퍼히어로 망토', image: '🦸', price: 250, owned: false, equipped: false },
    { id: 'clothes_2', type: 'clothes', name: '우주복', image: '🚀', price: 300, owned: false, equipped: false },
    { id: 'clothes_3', type: 'clothes', name: '닌자 복장', image: '🥷', price: 280, owned: false, equipped: false },
    { id: 'clothes_4', type: 'clothes', name: '왕실 예복', image: '🤴', price: 400, owned: false, equipped: false },
    { id: 'clothes_5', type: 'clothes', name: '과학자 코트', image: '🧑‍🔬', price: 320, owned: false, equipped: false },
    
    // 악세서리
    { id: 'acc_1', type: 'accessory', name: '별 지팡이', image: '⭐', price: 180, owned: false, equipped: false },
    { id: 'acc_2', type: 'accessory', name: '마법 책', image: '📚', price: 160, owned: false, equipped: false },
    { id: 'acc_3', type: 'accessory', name: '트로피', image: '🏆', price: 220, owned: false, equipped: false },
    { id: 'acc_4', type: 'accessory', name: '용기의 방패', image: '🛡️', price: 260, owned: false, equipped: false },
    { id: 'acc_5', type: 'accessory', name: '빛나는 보석', image: '💎', price: 320, owned: false, equipped: false },
    
    // 캐릭터 변경
    { id: 'char_1', type: 'character', name: '밝은 미소', image: '😀', price: 350, owned: false, equipped: false },
    { id: 'char_2', type: 'character', name: '선글라스 히어로', image: '😎', price: 400, owned: false, equipped: false },
    { id: 'char_3', type: 'character', name: '별 스타', image: '🤩', price: 420, owned: false, equipped: false },
    { id: 'char_4', type: 'character', name: '마법사', image: '🧙', price: 380, owned: false, equipped: false },
    { id: 'char_5', type: 'character', name: '우주 탐험가', image: '👨‍🚀', price: 450, owned: false, equipped: false },
  ];

  // 소유한 아이템 체크
  const getItemStatus = (item: CharacterItem) => {
    const ownedItem = profile.character.items.find((i) => i.id === item.id);
    if (ownedItem) {
      return { ...item, owned: true, equipped: ownedItem.equipped };
    }
    return item;
  };

  const filteredItems = shopItems
    .filter((item) => item.type === selectedCategory)
    .map(getItemStatus);

  const handlePurchase = (item: CharacterItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedItem && profile.coins >= selectedItem.price) {
      purchaseItem(selectedItem);
      setShowPurchaseModal(false);
      setSelectedItem(null);
    }
  };

  const categories = [
    { value: 'hat' as const, label: '모자', emoji: '🎩' },
    { value: 'clothes' as const, label: '의상', emoji: '👕' },
    { value: 'accessory' as const, label: '악세서리', emoji: '✨' },
    { value: 'character' as const, label: '캐릭터 변경', emoji: '🧑‍🎨' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
        >
          <span className="text-2xl">←</span>
          <span>돌아가기</span>
        </motion.button>

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary-600 mb-2">
                아이템 상점 🛒
              </h1>
              <p className="text-gray-600">코인으로 멋진 아이템을 구매하세요!</p>
            </div>
            <div className="text-center bg-yellow-100 rounded-2xl p-4">
              <div className="text-4xl mb-2">🪙</div>
              <div className="text-3xl font-bold text-yellow-600">{profile.coins}</div>
              <div className="text-sm text-gray-600">보유 코인</div>
            </div>
          </div>
        </motion.div>

        {/* 카테고리 선택 */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all ${
                selectedCategory === category.value
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mr-2">{category.emoji}</span>
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* 아이템 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`card ${
                item.equipped
                  ? 'border-4 border-green-400 bg-green-50'
                  : item.owned
                  ? 'border-2 border-blue-300'
                  : ''
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-3">{item.image}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                
                {item.owned ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => equipItem(item.id)}
                    className={`w-full py-2 px-4 rounded-xl font-bold ${
                      item.equipped
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {item.equipped ? '착용 중 ✓' : '착용하기'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePurchase(item)}
                    disabled={profile.coins < item.price}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>🪙</span>
                      <span>{item.price}</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600">이 카테고리에는 아이템이 없어요.</p>
          </div>
        )}
      </div>

      {/* 구매 확인 모달 */}
      <AnimatePresence>
        {showPurchaseModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-md w-full text-center"
            >
              <div className="text-7xl mb-4">{selectedItem.image}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedItem.name}
              </h2>
              <p className="text-gray-600 mb-6">
                이 아이템을 구매하시겠어요?
              </p>
              
              <div className="bg-yellow-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-700">
                  <span>🪙</span>
                  <span>{selectedItem.price}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  구매 후 보유 코인: {profile.coins - selectedItem.price}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-xl"
                >
                  취소
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmPurchase}
                  className="flex-1 btn-success"
                >
                  구매하기
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;

