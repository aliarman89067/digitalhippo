import { getServerSideUser } from "@/lib/payload-utils";
import Image from "next/image";
import { cookies } from "next/headers";
import { getPayloadClient } from "@/get-payload";
import { notFound, redirect } from "next/navigation";
import { Product, ProductFile, User } from "@/payload-types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import PaymentStatus from "@/components/PaymentStatus";

interface SearchParamsProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const ThankYouPage = async ({ searchParams }: SearchParamsProps) => {
  const orderId = searchParams.orderId;
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);
  const payload = await getPayloadClient();
  const { docs: orders } = await payload.find({
    collection: "orders",
    depth: 2,
    where: {
      id: {
        equals: orderId,
      },
    },
  });
  const [order] = orders;
  if (!order) return notFound();
  const orderUserId =
    typeof order.user === "string" ? order.user : order.user.id;
  if (orderUserId !== user?.id) {
    return redirect(`/sign-in?origin=thank-you?orderId=${orderId}`);
  }
  const products = order.product as Product[];
  const totalPrice = products.reduce((total, { price }) => total + price, 0);

  return (
    <main className="relative lg:min-h-full">
      <div className="hidden lg:block h-80 overflow-hidden lg:absolute z-0 lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          src="/checkout-thank-you.jpg"
          fill
          className="h-full w-full object-cover object-center"
          alt="thanks you for your order"
        />
      </div>
      <div className="z-10">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6  sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <p className="text-sm font-medium text-blue-600">
              Order successfull
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Thanks for ordering
            </h1>
            {order._isPaid ? (
              <p className="mt-2 text-base text-muted-foreground">
                Your order was processed and your assets are available to
                download below we&apos;ve send your receipt and order details to{" "}
                {typeof order.user !== "string" ? (
                  <span className="font-medium text-gray-900">
                    {order.user.email}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="mt-2 text-base text-muted-foreground">
                We appreciate your order we&apos;re currently processing so hang
                tight and we&apos;ll send you confirmation very soon
              </p>
            )}
            <div className="mt-16 text-sm font-medium">
              <div className="text-muted-foreground">Order nr,</div>
              <div className="mt-2 text-gray-900">{order.id}</div>
              <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-muted-foreground">
                {(order.product as Product[]).map((product) => {
                  const downloadUrl = (product.product_files as ProductFile)
                    .url as string;
                  const { image } = product.images[0];
                  return (
                    <li className="flex space-x-6 py-6" key={product.id}>
                      <div className="relative h-24 w-24">
                        {typeof image !== "string" && image.url ? (
                          <Image
                            fill
                            src={image.url}
                            alt={`${product.name} Image`}
                            className="flex-none rounded-md bg-gray-100 object-cover object-center"
                          />
                        ) : null}
                      </div>
                      <div className="flex-auto flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="text-gray-900">{product.name}</h3>
                          <p className="my-1">Category: {product.category}</p>
                        </div>
                        {order._isPaid ? (
                          <a
                            href={downloadUrl}
                            download={product.name}
                            className="text-rose-600 hover:underline underline-offset-2"
                          >
                            Download asset
                          </a>
                        ) : null}
                      </div>
                      <p className="flex-none font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <div className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-muted-foreground">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="text-gray-900">{formatPrice(totalPrice)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Transaction Fee</p>
                  <p className="text-gray-900">{formatPrice(1)}</p>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-6 text-gray-900">
                  <p className="text-base">Total</p>
                  <p className="text-base">{formatPrice(totalPrice + 1)}</p>
                </div>
              </div>

              <PaymentStatus
                orderId={order.id}
                isPaid={order._isPaid}
                orderEmail={(order.user as User).email}
              />

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <Link
                  href="/products"
                  className="text-sm font-medium text-rose-600 hover:text-rose-500"
                >
                  Continue Shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default ThankYouPage;