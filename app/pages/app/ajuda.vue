<template>
  <div>
    <UiCard class="mt-10 mb-6">
      <UiCardHeader>
        <UiCardTitle>Respostas</UiCardTitle>
        <UiCardDescription>
          Encontre respostas para suas dúvidas e aprenda a utilizar todas as funcionalidades do sistema
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <UiTabs defaultValue="geral" class="w-full">
          <UiTabsList class="grid w-full grid-cols-2 lg:grid-cols-4">
            <UiTabsTrigger value="geral">Geral</UiTabsTrigger>
            <UiTabsTrigger value="acesso">Acesso</UiTabsTrigger>
            <UiTabsTrigger value="perfis">Perfis</UiTabsTrigger>
            <UiTabsTrigger value="suporte">Suporte</UiTabsTrigger>
          </UiTabsList>

          <UiTabsContent value="geral">
            <div class="space-y-4 mt-4">
              <UiAccordion type="single" collapsible>
                <div class="rounded-lg border p-4 shadow-sm bg-background">
                  <UiAccordionItem value="item-1">
                    <!-- Pergunta com fonte semibold e tamanho grande -->
                    <UiAccordionTrigger class="font-semibold text-lg">
                      O que é o SIGE Café?
                    </UiAccordionTrigger><br />
                    <UiAccordionContent>
                      <!-- Resposta com fonte pequena e cor atenuada -->
                      <p class="text-justify text-sm text-muted-foreground">
                        É uma plataforma digital projetada para otimizar a gestão do setor cafeeiro, com funcionalidades
                        voltadas para o registro de transações de compra e venda de café, atualização de informações de
                        cadastro dos usuários, como cafeicultores, associados e cooperativas. Com um design simples, a
                        plataforma é acessível até mesmo para usuários com pouca familiaridade com tecnologia. O sistema
                        oferece uma visualização intuitiva de um dashboard, que apresenta informações sobre o preço das
                        sacas de café em tempo real por meio de API, além de permitir o controle da gestão de associados
                        das cooperativas. Outra característica importante é o monitoramento climático, que auxilia os
                        cafeicultores a gerenciar a produção de café, garantindo que as condições climáticas não afetem
                        negativamente a qualidade e o valor de venda de suas safras.
                      </p>
                    </UiAccordionContent>
                  </UiAccordionItem>
                </div>

                <div class="rounded-lg border p-4 shadow-sm bg-background">
                  <UiAccordionItem value="item-2">
                    <!-- Pergunta com fonte semibold e tamanho grande -->
                    <UiAccordionTrigger class="font-semibold text-lg">
                      Como funciona o sistema de notificações?
                    </UiAccordionTrigger><br />
                    <UiAccordionContent>
                      <!-- Resposta com fonte pequena e cor atenuada -->
                      <p class="text-justify text-sm text-muted-foreground">
                        O sistema de notificações envia atualizações por SMS de acordo com o perfil do usuário,
                        oferecendo informações sobre movimentações de compra e venda de café, preços das sacas em tempo
                        real e condições climáticas que afetam a produção. As notificações são personalizáveis,
                        garantindo relevância para cada usuário.
                      </p>
                    </UiAccordionContent>
                  </UiAccordionItem>
                </div>
              </UiAccordion>
            </div>
          </UiTabsContent>



          <UiTabsContent value="acesso">
            <div class="space-y-4 mt-4">
              <UiAccordion type="single" collapsible>

                <!-- Bloco 1: Login -->
                <div class="rounded-lg border p-4 shadow-sm bg-background">
                  <UiAccordionItem value="item-1">
                    <UiAccordionTrigger class="font-semibold text-lg">
                      Como faço login no sistema?
                    </UiAccordionTrigger>
                    <UiAccordionContent>
                      <ol class="list-decimal pl-6 mt-2 space-y-2 text-sm text-muted-foreground">
                        <li>Acesse a página de login</li>
                        <li>Digite seu e-mail cadastrado</li>
                        <li>Digite sua senha</li>
                        <li>Clique em <strong>"Entrar"</strong></li>
                      </ol>
                    </UiAccordionContent>
                  </UiAccordionItem>
                </div>

                <!-- Bloco 2: Recuperar Senha -->
                <div class="rounded-lg border p-4 shadow-sm bg-background">
                  <UiAccordionItem value="item-2">
                    <UiAccordionTrigger class="font-semibold text-lg">
                      Como recuperar minha senha?
                    </UiAccordionTrigger>
                    <UiAccordionContent>
                      <p class="mt-2 text-sm text-muted-foreground text-justify">
                        Na página de login, clique em <strong>"Esqueci minha senha"</strong> e siga as instruções
                        enviadas para seu e-mail cadastrado.
                      </p>
                    </UiAccordionContent>
                  </UiAccordionItem>
                </div>

              </UiAccordion>
            </div>
          </UiTabsContent>


          <UiTabsContent value="perfis">
            <div class="space-y-4 mt-4">
              <UiAccordion type="single" collapsible>
                <div class="rounded-lg border p-6 shadow-sm bg-background">
                  <UiAccordionItem value="item-1">
                    <UiAccordionTrigger class="font-semibold text-lg">
                      Quais são os tipos de perfis disponíveis?
                    </UiAccordionTrigger>
                    <UiAccordionContent>
                      <ul class="list-disc pl-6 space-y-2 text-justify text-sm text-muted-foreground mt-2">
                        <li><strong>Administrador:</strong> Gerencia todas as configurações da plataforma</li>
                        <li><strong>Cafeicultor:</strong> Acompanha, registra e gerencia as movimentações da produção e
                          venda de café.</li>
                        <li><strong>Cooperativa:</strong> Gerencia cafeicultores, monitora preços e indica associados
                          interessados na compra.</li>
                        <li><strong>Associados:</strong> Indicam interesse em comprar café, e a cooperativa intermedia a
                          venda.</li>
                      </ul>
                    </UiAccordionContent>
                  </UiAccordionItem>
                </div>
              </UiAccordion>
            </div>
          </UiTabsContent>


          <UiTabsContent value="suporte">
            <div class="mt-4 space-y-6">
              <div class="rounded-lg border p-4">
                <h3 class="font-semibold mb-2">Precisa de ajuda adicional?</h3>
                <p class="text-sm text-muted-foreground mb-4">
                  Nossa equipe está disponível para ajudar com qualquer dúvida ou problema técnico.
                </p>
                <UiButton>
                  <Icon name="lucide:message-square" class="mr-2 h-4 w-4" />
                  Contatar Suporte
                </UiButton>
              </div>
            </div>
          </UiTabsContent>
        </UiTabs>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts" setup></script>

<style>
.text-opacity-custom {
  opacity: 0.8;
  /* Ajuste conforme necessário */
}
</style>