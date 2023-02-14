import { LightningElement, wire, api } from 'lwc';
import searchTeams from '@salesforce/apex/TeamController.searchTeams';
export default class TeamList extends LightningElement {
	searchTerm = '';
	@api selectedTeamId;
	@api showTeamView;

	@wire(searchTeams, {searchTerm: '$searchTerm'})
	teams;
	handleSearchTermChange(event) {
		// Debouncing this method: do not update the reactive property as
		// long as this function is being called within a delay of 300 ms.
		// This is to avoid a very large number of Apex method calls.
		window.clearTimeout(this.delayTimeout);
		const searchTerm = event.target.value;
		// eslint-disable-next-line @lwc/lwc/no-async-operation
		this.delayTimeout = setTimeout(() => {
			this.searchTerm = searchTerm;
		}, 300);
	}
	get hasResults() {
		return (this.teams.data.length > 0);
	}

	handleViewTeamMembers(event){
		this.selectedTeamId = event.target.dataset.set;
		if(this.selectedTeamId){
			this.showTeamView = true;
		}
	}
	
	backToListView(event){
		this.showTeamView = false;
		this.selectedTeamId = '';
	}
}