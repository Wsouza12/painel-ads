"use client";

import { useState, useRef, useEffect } from "react";
import { updateProduct, uploadImage, generateVideoUploadUrl, pushDescriptionToML } from "@/app/dashboard/actions";

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
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [formValues, setFormValues] = useState({
    title: product.custom_title || product.original_title,
    price: product.custom_price || product.original_price,
    image_url: product.custom_image_url || "",
    video_url: product.custom_video_url || "",
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

  async function handleUnlinkAB() {
    const { unlinkABTest } = await import("@/app/dashboard/actions");
    await unlinkABTest(product.id);
    window.location.reload(); // Simple way to refresh the parent list since state is up
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
                  placeholder="Insira a URL da imagem ou faça upload"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="text-xs text-neutral-400 flex justify-between items-end mb-1">
                  <span>URL do Vídeo (Opcional - Para feed de vídeo)</span>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-xs bg-neutral-700 hover:bg-neutral-600 px-2 py-0.5 rounded flex items-center gap-1 transition-colors text-neutral-200 border border-neutral-600"
                  >
                    {isUploading ? "..." : "📎 Fazer Upload (Max 50MB)"}
                  </button>
                </label>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  className="hidden"
                />
                <input
                  name="custom_video_url"
                  value={formValues.video_url}
                  onChange={e => setFormValues({...formValues, video_url: e.target.value})}
                  placeholder="Ex: https://seusite.com/video.mp4"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mt-1"
                />
                {formValues.video_url && (
                  <div className="mt-2 rounded bg-black overflow-hidden border border-neutral-700 max-h-32 flex justify-center">
                    <video src={formValues.video_url} controls className="max-h-32 object-contain" />
                  </div>
                )}
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

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = "";

    // Optional client-side size check (e.g., 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("O vídeo é muito grande. O tamanho máximo permitido é 50MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      
      // 1. Pede permissão para o Servidor (bypassa limite de 6MB do Netlify)
      const { signedUrl, publicUrl } = await generateVideoUploadUrl(fileExt);
      
      // 2. Faz o upload direto do navegador do cliente para o Supabase
      const res = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!res.ok) {
        throw new Error("Falha ao enviar arquivo direto para a nuvem.");
      }

      setFormValues({ ...formValues, video_url: publicUrl });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="group rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-sm p-5 hover:bg-neutral-800/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/40 rounded-xl overflow-hidden border border-white/5 shadow-inner cursor-pointer" onClick={() => {
            setModalImages([product.original_image_url]);
            setShowImageModal(true);
          }}>
            <img src={displayImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">{displayTitle}</h3>
          <p className="text-emerald-400 text-lg font-black mt-1 tracking-tight">R$ {Number(displayPrice).toFixed(2)}</p>
          
          {/* Metricas de Trafego */}
          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-neutral-400">
            <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full border border-white/5 shadow-inner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="text-neutral-300">{product.views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full border border-white/5 shadow-inner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                <path d="M15 3h6v6"/>
                <path d="M10 14L21 3"/>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              </svg>
              <span className="text-neutral-300">{product.clicks || 0}</span>
            </div>
          </div>
          
          {isVariantA && (
            <span className="inline-block mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/30 w-max border border-purple-400/30">
              🧪 Teste A/B Ativo (Var A)
            </span>
          )}
          
          {isVariantB && (
            <span className="inline-block mt-3 bg-black/40 text-neutral-400 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 w-max">
              Vinculado ao Teste (Var B)
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex-1 flex flex-col justify-end">
        {!isVariantB ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 text-[11px] font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 py-2.5 rounded-lg border border-white/5 transition-all"
            >
              Editar Anúncios
            </button>
            <a
              href={`/p/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/20 hover:bg-emerald-600/30 py-2.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all group/view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/view:scale-110 transition-transform">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Ver Pág. Ponte
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
            <p className="text-[11px] font-medium text-neutral-500">
              Editado pela Variante A
            </p>
            <button
              onClick={handleUnlinkAB}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1 rounded-full transition-colors"
            >
              Desvincular
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <p className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">Catálogo Único (Meta Ads)</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const url = `${window.location.origin}/api/ml/feed/single/${product.id}?bridge=true`;
                navigator.clipboard.writeText(url);
                alert("Link do Catálogo (Página Ponte) copiado!");
              }}
              className="flex items-center justify-between w-full text-[11px] font-semibold text-purple-200 hover:text-white bg-purple-900/10 hover:bg-purple-600/20 px-3 py-2.5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all text-left group/btn"
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400 group-hover/btn:scale-110 transition-transform">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span>Link da Página Ponte</span>
              </div>
              <span className="text-[9px] uppercase font-black text-purple-500/50 group-hover/btn:text-purple-400">Copiar</span>
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/api/ml/feed/single/${product.id}?bridge=false`;
                navigator.clipboard.writeText(url);
                alert("Link do Catálogo (Direto ML) copiado!");
              }}
              className="flex items-center justify-between w-full text-[11px] font-semibold text-blue-200 hover:text-white bg-blue-900/10 hover:bg-blue-600/20 px-3 py-2.5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all text-left group/btn"
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400 group-hover/btn:scale-110 transition-transform">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <span>Link Direto pro ML</span>
              </div>
              <span className="text-[9px] uppercase font-black text-blue-500/50 group-hover/btn:text-blue-400">Copiar</span>
            </button>
          </div>
        </div>
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
