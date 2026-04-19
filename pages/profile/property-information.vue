<script setup>
// Renamed to collaborator-detail.vue — redirect for backwards compatibility
definePageMeta({ title: 'Collaborators - UmovingU', middleware: 'auth' });
const route = useRoute();
navigateTo(route.query.id ? `/profile/collaborator-detail?id=${route.query.id}` : '/profile/collaborator-information', { replace: true });
</script>
