import { prisma } from "@/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";
import { ProductForm } from "./product-form";
import { DeleteButton } from "./delete-button";
import { EditButton } from "./edit-button";
import { BackButton } from "@/components/ui/back-button";
import Image from "next/image";
import { Layers2 } from "lucide-react";

type ProductRow = Prisma.ProductGetPayload<Record<string, never>>;

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
      <div className="flex items-center gap-6">
        <BackButton />
        <div className="border-l border-border/50 pl-6 py-2">
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground">
            Produtos
          </h1>
          <p className="text-muted-foreground mt-1 text-md md:text-lg">
            Gestão de Massas, Cucas e Delícias Artesanais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulário */}
        <div className="lg:col-span-1 border border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm h-fit">
          <h2 className="font-display text-2xl font-semibold mb-6 text-foreground">
            Novo Produto
          </h2>
          <ProductForm />
        </div>

        {/* Catálogo */}
        <div className="lg:col-span-2 border border-border/50 bg-card rounded-[2.5rem] shadow-sm overflow-hidden p-8 min-h-[500px]">
          <h2 className="font-display text-2xl font-semibold mb-6 text-foreground">
            Seu Catálogo
          </h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 h-full text-center space-y-4">
              <p className="text-muted-foreground italic text-lg opacity-60">
                Nenhum produto cadastrado ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product: ProductRow) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/70 rounded-2xl hover:border-primary/20 hover:bg-secondary/5 transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary/20 border border-border/50 flex-shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 italic text-[10px] text-center p-1">
                          Sem foto
                        </div>
                      )}
                      {/* Badge quantidade de imagens */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-0.5 right-0.5 bg-primary/80 text-primary-foreground text-[8px] font-bold px-1 rounded-full">
                          {product.images.length}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold text-foreground leading-snug">
                        {product.name}
                      </h3>

                      {/* Variante e Grupo */}
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {product.variantName && (
                          <span className="text-xs bg-secondary/60 text-foreground/70 px-2 py-0.5 rounded-full font-medium">
                            {product.variantName}
                          </span>
                        )}
                        {product.groupId && (
                          <span className="text-xs bg-primary/10 text-primary/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Layers2 className="w-2.5 h-2.5" />
                            {product.groupId}
                          </span>
                        )}
                        {product.category && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      )}

                      <p className="text-primary mt-1 font-bold text-base">
                        R${" "}
                        {parseFloat(product.price.toString()).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="sm:ml-auto flex-shrink-0 flex items-center gap-2">
                    <EditButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price.toString(),
                        description: product.description,
                        category: product.category,
                        groupId: product.groupId,
                        variantName: product.variantName,
                        flavors: product.flavors,
                        images: product.images,
                      }}
                    />
                    <DeleteButton id={product.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
