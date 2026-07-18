"use client";

import { useState, useRef, useEffect } from "react";
import { updateProduct, uploadImage, pushDescriptionToML } from "@/app/dashboard/actions";

export default function ProductList({ products, abTests }: { products: any[], abTests: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-sm font-medium text-neutral-400 mb-3">Seus Produtos (Edite para o Facebook e ML)</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.filter(p => p.original_condition !== "paused").map((product) => (
          <ProductCard key={product.id} product={product} allProducts={products} abTests={abTests} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, allProducts, abTests }: { product: any; allProducts: any[]; abTests: any[] }) {
  const isVariantA = abTests.find(t => t.product_id === product.id);
  const isVariantB = abTests.find(t => t.variant_b_product_id === product.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizingSEO, setIsOptimizingSEO] = useState(false);
  const [seoDescription, setSeoDescription] = useState("");
  const [isPushingSEO, setIsPushingSEO] = useState(false);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [formValues, setFormValues] = useState({
    title: product.custom_title || product.original_title,
    price: product.custom_price || product.original_price,
    image_url: product.custom_image_url || "",
  });

  const displayTitle = product.custom_title || product.original_title;
  const displayPrice = product.custom_price || product.original_price;
  const displayImage = product.custom_image_url || `/api/og/product?id=${product.ml_item_id}&t=${product.updated_at || Date.now()}`;

  const [abTest, setAbTest] = useState<any>(null);
  const [isGeneratingAB, setIsGeneratingAB] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [hasLoadedAB, setHasLoadedAB] = useState(false);
  const [selectedVariantBId, setSelectedVariantBId] = useState("");

  // Function to load the active AB test on edit
  async function loadABTest() {
    if (!product.id) return;
    const { getActiveABTest } = await import("@/app/dashboard/actions");
    const test = await getActiveABTest(product.id);
    if (test) setAbTest(test);
    setHasLoadedAB(true);
  }

  useEffect(() => {
    if (isEditing && !hasLoadedAB) {
      loadABTest();
    }
  }, [isEditing, hasLoadedAB]);

  async function handleGenerateAB() {
    if (!selectedVariantBId) {
      alert("Por favor, selecione o produto secundário (Variante B) na lista.");
      return;
    }
    const variantB = allProducts.find(p => p.id === selectedVariantBId);
    if (!variantB) return;

    setIsGeneratingAB(true);
    try {
      const res = await fetch("/api/ai/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.original_title,
          price: product.original_price,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Erro da IA: " + data.error);
      } else {
        const { createABTest } = await import("@/app/dashboard/actions");
        await createABTest(product.id, data.variantA, data.variantB, variantB.id);
        alert("Laboratório A/B criado com sucesso! O Facebook vai otimizar automaticamente.");
        loadABTest();
      }
    } catch (err) {
      alert("Erro ao conectar com a IA");
    }
    setIsGeneratingAB(false);
  }

  async function handleStopAB() {
    const { stopABTest } = await import("@/app/dashboard/actions");
    await stopABTest(product.id);
    setAbTest(null);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateProduct(product.id, formData);
      setIsEditing(false);
    } catch (err) {
      alert("Erro ao salvar o produto.");
      console.error(err);
    }
    setIsSaving(false);
  }

  async function handleOptimize() {
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.original_title,
          price: product.original_price,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Erro da IA: " + data.error);
      } else {
        setFormValues(prev => ({
          ...prev,
          title: data.optimizedTitle,
          image_url: data.generatedImageUrl,
        }));
        if (data.imagePrompt) setAiPrompt(data.imagePrompt);
      }
    } catch (err) {
      alert("Erro ao conectar com a IA");
    }
    setIsOptimizing(false);
  }

  async function handleOptimizeSEO() {
    setIsOptimizingSEO(true);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.original_title,
          price: product.original_price,
          originalDescription: "", 
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Erro da IA: " + data.error);
      } else {
        setSeoDescription(data.optimizedDescription);
      }
    } catch (err) {
      alert("Erro ao conectar com a IA");
    }
    setIsOptimizingSEO(false);
  }

  async function handlePushSEO() {
    setIsPushingSEO(true);
    try {
      await pushDescriptionToML(product.id, seoDescription);
      alert("Descrição publicada no Mercado Livre com sucesso! 🚀");
      setSeoDescription("");
    } catch (err: any) {
      alert("Erro ao publicar no ML: " + err.message);
    }
    setIsPushingSEO(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const publicUrl = await uploadImage(formData);
      setFormValues(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err: any) {
      alert("Erro ao fazer upload: " + err.message);
    }
    setIsUploading(false);
  }

  async function openImageModal() {
    setShowImageModal(true);
    if (modalImages.length > 0) return; // já buscou
    setIsLoadingImages(true);
    try {
      const res = await fetch(`/api/ml/images?id=${product.ml_item_id}`);
      const data = await res.json();
      if (data.images) {
        setModalImages(data.images);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoadingImages(false);
  }

  const [isGeneratingArt, setIsGeneratingArt] = useState(false);

  async function handleGeneratePremiumArt() {
    setIsGeneratingArt(true);
    try {
      const res = await fetch(`/api/ai/generate-ad?productId=${product.id}&t=${Date.now()}`);
      if (!res.ok) throw new Error("Falha ao gerar a arte na Vercel Edge");
      
      const blob = await res.blob();
      const file = new File([blob], `premium_ad_${product.id}.png`, { type: "image/png" });
      
      const formData = new FormData();
      formData.append("image", file);
      
      const publicUrl = await uploadImage(formData);
      setFormValues(prev => ({ ...prev, image_url: publicUrl }));
      alert("Arte Premium Gerada e salva na nuvem com sucesso! 🎨✨");
    } catch (err: any) {
      alert("Erro ao gerar arte: " + err.message);
    }
    setIsGeneratingArt(false);
  }

  if (isEditing) {
    // Load the test once if we haven't checked yet
    if (!abTest && !showLab) {
      loadABTest();
    }
    
    return (
      <div className="rounded-md border border-neutral-700 bg-neutral-800 p-4 space-y-4 relative overflow-hidden">
        {isOptimizing && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
            <p className="text-sm text-emerald-400 animate-pulse font-medium">A IA está pensando (Groq + DALL-E)...</p>
          </div>
        )}
        {isGeneratingArt && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
            <p className="text-sm text-amber-400 animate-pulse font-medium text-center px-4">
              A IA está compondo a Arte Premium...<br/>Isso leva cerca de 5 segundos.
            </p>
          </div>
        )}
        {isGeneratingAB && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
            <p className="text-sm text-purple-400 animate-pulse font-medium text-center px-4">
              Criando Teste A/B (Desconto vs Alto Valor)...<br/>Isso pode demorar alguns segundos.
            </p>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
            <p className="text-sm text-emerald-400 animate-pulse font-medium">Enviando imagem para a nuvem...</p>
          </div>
        )}
        {isOptimizingSEO && (
          <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
            <p className="text-sm text-emerald-400 animate-pulse font-medium">Criando descrição matadora pro ML...</p>
          </div>
        )}
        
        {/* Header Tabs */}
        <div className="flex gap-2 border-b border-neutral-700 pb-2">
          <button 
            type="button"
            onClick={() => setShowLab(false)}
            className={`text-xs px-3 py-1.5 rounded font-bold ${!showLab ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-700/50'}`}
          >
            Editar Anúncio Normal
          </button>
          <button 
            type="button"
            onClick={() => { setShowLab(true); loadABTest(); }}
            className={`text-xs px-3 py-1.5 rounded font-bold flex items-center gap-1 ${showLab ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'text-purple-400 hover:bg-purple-900/30'}`}
          >
            🧪 Laboratório A/B {abTest ? "(Ativo)" : ""}
          </button>
        </div>

        {showLab ? (
          <div className="space-y-4">
            {!abTest ? (
              <div className="text-center py-6 space-y-3 bg-purple-950/20 border border-purple-900/50 rounded p-4">
                <h4 className="text-sm font-bold text-purple-400">Descubra como vender mais caro!</h4>
                <p className="text-xs text-neutral-400">
                  A IA vai criar duas versões da copy pro Facebook Ads: uma focada em <strong className="text-white">Desconto</strong> (que vai para o produto A) e outra focada em <strong className="text-white">Alto Valor</strong> (que vai para o produto B).
                </p>
                <div className="text-left bg-purple-900/40 p-3 rounded mt-2 border border-purple-800">
                  <label className="text-xs text-purple-300 font-bold block mb-1">Selecione o Produto para a Variante B (Ex: Preço mais caro/barato)</label>
                  <select 
                    value={selectedVariantBId}
                    onChange={(e) => setSelectedVariantBId(e.target.value)}
                    className="w-full bg-neutral-900 border border-purple-800 rounded px-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="">-- Escolha um produto --</option>
                    {allProducts.filter(p => p.id !== product.id && p.original_condition !== "paused" && !abTests.find(t => t.product_id === p.id || t.variant_b_product_id === p.id)).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.custom_title || p.original_title} - R$ {Number(p.custom_price || p.original_price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateAB}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded shadow-[0_0_15px_rgba(147,51,234,0.4)] w-full mt-2"
                >
                  🧪 Criar Teste A/B Agora
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h4 className="text-sm font-bold text-white">Teste A/B Rodando no Facebook!</h4>
                  </div>
                  <button onClick={handleStopAB} className="text-[10px] text-red-400 hover:underline">
                    Parar Teste
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neutral-900 border border-neutral-700 rounded p-3">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Variante A (Oferta/Desconto)</span>
                    <p className="text-xs text-white mt-1 font-medium">{abTest.variant_a_title}</p>
                    <p className="text-[10px] text-neutral-500 mt-2 truncate line-clamp-3 leading-tight">{abTest.variant_a_desc}</p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-800 rounded p-3">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Variante B (Alto Valor/Premium)</span>
                    <p className="text-xs text-white mt-1 font-medium">{abTest.variant_b_title}</p>
                    <p className="text-[10px] text-neutral-500 mt-2 truncate line-clamp-3 leading-tight">{abTest.variant_b_desc}</p>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-400 text-center">
                  O arquivo Feed CSV foi atualizado. O Meta Ads vai mostrar essas duas versões para os clientes e investir seu orçamento na que tiver mais vendas!
                </p>
              </div>
            )}
            
            <button onClick={() => setIsEditing(false)} className="w-full bg-neutral-700 hover:bg-neutral-600 text-white text-xs px-3 py-2 rounded">
              Fechar Laboratório
            </button>
          </div>
        ) : (
          <>
            {/* Facebook Ads Form */}
            <form onSubmit={handleSave} className="space-y-3 pb-3 border-b border-neutral-700">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-white">Editar Anúncio (Meta Ads)</h4>
                <button
                  type="button"
                  onClick={handleOptimize}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all"
                >
                  ✨ Otimizar com IA
                </button>
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Título no Facebook</label>
                <input
                  name="custom_title"
                  value={formValues.title}
                  onChange={e => setFormValues({...formValues, title: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Preço Promocional (R$)</label>
                <input
                  name="custom_price"
                  type="number"
                  step="0.01"
                  value={formValues.price}
                  onChange={e => setFormValues({...formValues, price: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 flex justify-between items-end mb-1">
                  <span>Link de Imagem Personalizada (Opcional)</span>
                  <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormValues({...formValues, image_url: product.original_image_url})}
                        className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded flex items-center gap-1 transition-colors text-white border border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)] font-bold"
                      >
                        📥 Original (ML)
                      </button>
                      <button
                        type="button"
                        onClick={handleGeneratePremiumArt}
                        className="text-xs bg-amber-600 hover:bg-amber-500 px-2 py-0.5 rounded flex items-center gap-1 transition-colors text-white border border-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.5)] font-bold"
                      >
                        🎨 Gerar Arte Premium (IA)
                      </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-neutral-700 hover:bg-neutral-600 px-2 py-0.5 rounded flex items-center gap-1 transition-colors text-neutral-200 border border-neutral-600"
                    >
                      📎 Fazer Upload
                    </button>
                  </div>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  name="custom_image_url"
                  value={formValues.image_url}
                  onChange={e => setFormValues({...formValues, image_url: e.target.value})}
                  placeholder="Deixe em branco para gerar o Encarte Automático"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {aiPrompt && (
                <div className="bg-indigo-950/40 border border-indigo-900 rounded p-3">
                  <label className="text-xs text-indigo-300 font-bold block mb-1 flex items-center gap-1">
                    🎨 Prompt de Imagem (Copie e cole no Midjourney/ChatGPT)
                  </label>
                  <textarea
                    readOnly
                    value={aiPrompt}
                    rows={3}
                    className="w-full bg-black/30 border border-indigo-800/50 rounded px-2 py-1.5 text-xs text-indigo-100 outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-neutral-600 hover:bg-neutral-500 text-white text-xs px-3 py-1.5 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* Mercado Livre SEO Section */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-yellow-400">Otimização Mercado Livre (SEO)</h4>
                <button
                  type="button"
                  onClick={handleOptimizeSEO}
                  className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all"
                >
                  📝 Criar Descrição Agressiva
                </button>
              </div>

              {seoDescription && (
                <div className="bg-yellow-950/20 border border-yellow-900/50 rounded p-3 space-y-2">
                  <label className="text-xs text-yellow-500 block">Revise a nova descrição:</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={10}
                    className="w-full bg-neutral-900 border border-yellow-900/50 rounded p-2 text-xs text-neutral-300 outline-none focus:border-yellow-500"
                  />
                  <button
                    onClick={handlePushSEO}
                    disabled={isPushingSEO}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xs px-3 py-2 rounded disabled:opacity-50"
                  >
                    {isPushingSEO ? "Publicando no ML..." : "Publicar no Mercado Livre"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4 flex gap-4 items-start relative">
      <div className="relative group cursor-pointer" onClick={openImageModal}>
        <img
          src={displayImage}
          alt={displayTitle}
          className="w-20 h-20 object-contain rounded bg-white group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded">
          <span className="text-white text-xs font-bold">Ver Fotos</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white truncate">{displayTitle}</h3>
        <p className="text-emerald-400 text-sm font-bold mt-1">R$ {Number(displayPrice).toFixed(2)}</p>
        
        {isVariantA && (
          <span className="inline-block mt-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow shadow-purple-500/50">
            🧪 Teste A/B Ativo (Variante A)
          </span>
        )}
        
        {isVariantB && (
          <span className="inline-block mt-2 bg-neutral-700 text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded shadow">
            Vinculado ao Teste A/B (Variante B)
          </span>
        )}

        {!isVariantB ? (
          <button
            onClick={() => setIsEditing(true)}
            className="block mt-3 text-xs text-neutral-400 hover:text-white underline"
          >
            Editar Anúncios
          </button>
        ) : (
          <p className="block mt-3 text-xs text-neutral-600">
            Editado pela Variante A
          </p>
        )}
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowImageModal(false)}>
          <div 
            className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-950">
              <div>
                <h3 className="text-white font-bold text-lg">Galeria de Imagens</h3>
                <p className="text-xs text-neutral-400">Estas são as fotos que o Facebook está usando para o Carrossel Dinâmico.</p>
              </div>
              <button onClick={() => setShowImageModal(false)} className="text-neutral-400 hover:text-white text-3xl leading-none">
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col bg-neutral-900">
              {isLoadingImages ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
                  <p className="text-neutral-400 font-medium animate-pulse">Puxando fotos originais do Mercado Livre...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* First image is the main one from Painel Ads */}
                  <div className="aspect-square bg-white rounded-lg border-2 border-emerald-500 overflow-hidden relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[10px] px-2 py-1 font-bold z-10 rounded-br-lg shadow">
                      Capa (Meta Ads)
                    </div>
                    <img src={displayImage} className="w-full h-full object-contain" />
                  </div>
                  {modalImages.map((img, i) => (
                    <div key={i} className="aspect-square bg-white rounded-lg border border-neutral-700 overflow-hidden group">
                      <img src={img} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                  {modalImages.length === 0 && !isLoadingImages && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-neutral-500">Nenhuma foto extra encontrada no Mercado Livre.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
