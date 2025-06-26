import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/patron/ranking')({
  component: RouteComponent
})

// TODO: Сделать вёрстку ранкжирования для обычного мецаната
//  Должно показывать тех студентов, которых он отметил зеленым и жёлтым. Сделать драг-н-дроп ранжирования (топ 1,2 и тп).
//  Первых двух надо выделить цветом, тк оба точно получат стипу. Сделать опцию удаления из ранкинга
//  Ссылку, переходя по которой можно будет открыть заявку аппликанта
function RouteComponent() {
  return <div>Hello "/patron/ranking"!</div>
}
