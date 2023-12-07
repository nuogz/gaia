<template>
	<!-- 侧边栏 -->
	<Sidebar hidden />


	<!-- 主模块 -->
	<p-main>
		<keep-alive>
			<component :is="moduleNow" :key="`module-${moduleNow}`" />
		</keep-alive>
	</p-main>
</template>

<script setup>
	import { onMounted } from 'vue';
	import { faCog } from '@fortawesome/free-solid-svg-icons';

	import CV from '@nuogz/css-var';
	import { Sidebar, moduleNow, tabAdmin } from '@nuogz/vue-sidebar';

	import './index.pcss';
	import './index.sass';



	document.title = '000';


	CV.widthSidebar = '7rem';
	CV.heightTopbar = '0rem';
	CV.widthScroll = '0.5rem';


	onMounted(() => tabAdmin.add('000-000', { type: 'icon|title', title: '000', icon: faCog || '000' }));
</script>

<style lang="sass" scoped>
p-main
	margin-top: var(--heightTopbar)
	margin-left: var(--widthSidebar)
	width: calc(100% - var(--widthSidebar))
	@apply block relative

	module
		@apply block relative
</style>

<style lang="sass">
.tippy-box[data-theme~='light-border']
	@apply shadow-mdd px-2 whitespace-pre text-left text-[var(--cTextMain)] bg-[var(--cMain)] #{!important}
</style>
