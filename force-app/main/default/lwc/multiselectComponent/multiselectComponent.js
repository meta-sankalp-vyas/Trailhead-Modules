import { LightningElement, track, api, wire } from 'lwc';
import Constants from 'c/constants';
import DomElementUtility from 'c/domElementUtility';
import getPickListValues from '@salesforce/apex/MultiSelectPicklistComponentController.getPickListValues';
import getFieldLabel from '@salesforce/apex/MultiSelectPicklistComponentController.getFieldLabel';

export default class MultiselectComponent extends LightningElement {

    @api label = ''
    @api multiselect = false;
    @api removeNoneAsOption = false;
    @api showSelectedAsPills = false;
    @api objectApiName = '';
    @api fieldApiName = '';
    @api allOptions = [];
    @api theme = 'royalblue';

    data = []
    dropDownClosed = true;
    trackCurrentKeyBoardIndex = -1;

    @track singleSelectedOption = '';
    multiSelectedOptions = [];
    trackMultiSelectedOptionsIds = [];

    //multiselectComponents Constant Variables
    MULTISELECT_COMPONENT_DROPDOWN_CLASS_NAME = '.dropdown-div';
    MULTISELECT_COMPONENT_DROPDOWN_UL_CLASS_NAME = '.multiselect_listitems_ul';
    MULTISELECT_COMPONENT_PILL_BOX_CLASS_NAME = '.pill-box-horizontal';
    MULTISELECT_COMPONENT_THEME_CSS_CLASS_PREFIX = 'multiselect_theme-';
    STATS_MESSAGE_POST_FIX = ' options selected...';
    LABEL_OF_NONE = '<-- None -->';
    NONE_ITEM_ID_POST_FIX = 'none';

    connectedCallback() {
        if(this.objectApiName && this.fieldApiName)
        {
            getPickListValues({
                objApiName: this.objectApiName,
                fieldApiName: this.fieldApiName
            }).then(data => {
                    if(data)
                    {
                        this.allOptions = data;
                    }
                    this.prepareRenderedOptions();
            }).catch(error => {
                this.prepareRenderedOptions();
            });
            getFieldLabel({
                objApiName: this.objectApiName,
                fieldApiName: this.fieldApiName
            }).then(data => {
                this.label = data;
            }).catch(error => {
            });
        }
    }

    prepareRenderedOptions() {
        this.data = [];
        if (!this.removeNoneAsOption) {
            this.data.push({ id: 'list_unique_elem_' + this.NONE_ITEM_ID_POST_FIX, value: this.LABEL_OF_NONE });
        }
        for (let index = 1; index <= this.allOptions.length; index++) {
            this.data.push({ id: 'list_unique_elem_' + index, label: this.allOptions[index - 1].label, value: this.allOptions[index - 1].value});
        }
    }

    handleKeyPress(event) {
        let keyPressed = event.keyCode;
        if ((keyPressed == Constants.DOWN_ARROW && this.dropDownClosed === true) || (keyPressed == Constants.ESCAPE && this.dropDownClosed === false) || (this.trackCurrentKeyBoardIndex == -1 && keyPressed == Constants.UP_ARROW && this.dropDownClosed === false)) {
            this.toggleDropDown(event);
        }
        if ((keyPressed == Constants.DOWN_ARROW || keyPressed == Constants.UP_ARROW || keyPressed == Constants.ENTER) && this.dropDownClosed === false) {
            this.handleKeyBoardUpDownCommands(event, keyPressed);
        }
    }

    handleKeyBoardUpDownCommands(event, keyPressed) {
        let parentULNode = this.template.querySelector(this.MULTISELECT_COMPONENT_DROPDOWN_UL_CLASS_NAME);
        let dropDownListNode = parentULNode.children;
        if (dropDownListNode) {
            let holdOldKeyBoardIndex = this.trackCurrentKeyBoardIndex;
            if (keyPressed == Constants.DOWN_ARROW) {
                this.trackCurrentKeyBoardIndex = (this.trackCurrentKeyBoardIndex + 1) >= dropDownListNode.length ? 0 : (this.trackCurrentKeyBoardIndex + 1);
            }
            else if (keyPressed == Constants.UP_ARROW) {
                this.trackCurrentKeyBoardIndex = (this.trackCurrentKeyBoardIndex - 1) <= -1 ? (dropDownListNode.length - 1) : (this.trackCurrentKeyBoardIndex - 1);
            }
            if (dropDownListNode[this.trackCurrentKeyBoardIndex]) {
                if (this.multiselect) {
                    DomElementUtility.addOrRemoveClassFromANode(dropDownListNode[this.trackCurrentKeyBoardIndex].children[0], Constants.CLASS_SLDS_HAS_FOCUS, DomElementUtility.ADD_ACTION);
                    if (holdOldKeyBoardIndex > -1) {
                        DomElementUtility.addOrRemoveClassFromANode(dropDownListNode[holdOldKeyBoardIndex].children[0], Constants.CLASS_SLDS_HAS_FOCUS, DomElementUtility.REMOVE_ACTION);
                    }
                }
                if (((!this.multiselect) || (this.multiselect && keyPressed == Constants.ENTER))) {
                    dropDownListNode[this.trackCurrentKeyBoardIndex].click();
                }
            }
        }
    }

    toggleDropDown(event) {
        if (this.dropDownClosed === true) {
            this.updatePropertiesOfElementsSpecified([this.template.querySelector(this.MULTISELECT_COMPONENT_DROPDOWN_CLASS_NAME)], [Constants.CLASS_SLDS_OPEN_DROPDOWN], DomElementUtility.ADD_ACTION, [Constants.ATTRIBUTE_ARIA_EXPANDED], this.dropDownClosed);
            this.updatePropertiesOfElementsSpecified([this.template.querySelector(this.MULTISELECT_COMPONENT_DROPDOWN_CLASS_NAME)], [Constants.CLASS_SLDS_CLOSE_DROPDOWN], DomElementUtility.REMOVE_ACTION, [], null);
            this.dropDownClosed = false;
        }
        else if (this.dropDownClosed === false) {
            this.updatePropertiesOfElementsSpecified([this.template.querySelector(this.MULTISELECT_COMPONENT_DROPDOWN_CLASS_NAME)], [Constants.CLASS_SLDS_CLOSE_DROPDOWN], DomElementUtility.ADD_ACTION, [Constants.ATTRIBUTE_ARIA_EXPANDED], this.dropDownClosed);
            this.updatePropertiesOfElementsSpecified([this.template.querySelector(this.MULTISELECT_COMPONENT_DROPDOWN_CLASS_NAME)], [Constants.CLASS_SLDS_OPEN_DROPDOWN], DomElementUtility.REMOVE_ACTION, [], null);
            this.dropDownClosed = true;
            if (this.multiSelectedOptions.length > 0) {
                this.updateCSSClassOfPills();
            }
        }
        return true;
    }

    optionClicked(event) {
        let flagCheck = false;
        this.updateIsSelectedClassTagInChildListElements(event.currentTarget.parentNode);
        let tempId = event.currentTarget.dataset.set;
        let allSelectedIds = this.trackMultiSelectedOptionsIds.join(', ');
        this.data.forEach(element => {
            if (tempId == element.id) {
                if (this.multiselect && (this.trackMultiSelectedOptionsIds.length == 0 || (!allSelectedIds.includes(tempId)))) {
                    if (!this.removeNoneAsOption && this.data[0].value == element.value) {
                        this.multiSelectedOptions = [];
                        this.trackMultiSelectedOptionsIds = [];
                        this.updateIsSelectedClassTagInChildListElements(event.currentTarget.parentNode);
                    }
                    else {
                        this.multiSelectedOptions.push(element);
                        this.trackMultiSelectedOptionsIds.push(element.id)
                    }
                    this.singleSelectedOption = this.multiSelectedOptions.length + this.STATS_MESSAGE_POST_FIX;
                    flagCheck = true;
                }
                else if (this.multiselect && allSelectedIds.includes(tempId)) {
                    this.multiSelectedOptions = this.multiSelectedOptions.filter(function (value, index, arr) { return element.id != value.id; })
                    this.trackMultiSelectedOptionsIds = this.trackMultiSelectedOptionsIds.filter(function (value, index, arr) { return element.id != value; })
                    this.updatePropertiesOfElementsSpecified([event.currentTarget.children[0]], [Constants.CLASS_SLDS_SELECTED, (this.MULTISELECT_COMPONENT_THEME_CSS_CLASS_PREFIX + this.theme)], DomElementUtility.REMOVE_ACTION, [Constants.ATTRIBUTE_ARIA_SELECTED], false);
                    this.singleSelectedOption = this.multiSelectedOptions.length + this.STATS_MESSAGE_POST_FIX;
                    return flagCheck;
                }
                else if (!this.multiselect) {
                    this.singleSelectedOption = (!this.removeNoneAsOption && this.data[0].value == element.value) ? '' : element.value;
                    flagCheck = true;
                }
                if (flagCheck) {
                    flagCheck = false;
                    this.updatePropertiesOfElementsSpecified([event.currentTarget.children[0]], [Constants.CLASS_SLDS_SELECTED, (this.MULTISELECT_COMPONENT_THEME_CSS_CLASS_PREFIX + this.theme)], DomElementUtility.ADD_ACTION, [Constants.ATTRIBUTE_ARIA_SELECTED], true);
                    flagCheck = true;
                    return flagCheck;
                }
            }
        });
        return flagCheck;
    }

    updateIsSelectedClassTagInChildListElements(node) {
        let allSelectedIds = this.trackMultiSelectedOptionsIds.join(', ');
        let listElements = this.getListedElementsChildNodes(node);
        listElements.forEach(lastElement => {
            if (lastElement && lastElement.classList && lastElement.classList.length > 0 && lastElement.classList.value.includes(Constants.CLASS_SLDS_SELECTED)) {
                if ((this.multiselect && !allSelectedIds.includes(lastElement.dataset.set)) || (!this.multiselect)) {
                    this.updatePropertiesOfElementsSpecified(lastElement, [Constants.CLASS_SLDS_SELECTED, (this.MULTISELECT_COMPONENT_THEME_CSS_CLASS_PREFIX + this.theme)], DomElementUtility.REMOVE_ACTION, [Constants.ATTRIBUTE_ARIA_SELECTED], false);
                }
            }
        })
    }

    updateCSSClassOfPills() {
        let selectedPillsChildElements = this.getListedElementsChildNodes(this.template.querySelector(this.MULTISELECT_COMPONENT_PILL_BOX_CLASS_NAME));
        if (selectedPillsChildElements) {
            this.updatePropertiesOfElementsSpecified(selectedPillsChildElements, [(this.MULTISELECT_COMPONENT_THEME_CSS_CLASS_PREFIX + this.theme)], DomElementUtility.ADD_ACTION, [], null); this.updatePropertiesOfElementsSpecified(selectedPillsChildElements, [(this.MULTISELECT_COMPONENT_THEME_CSS_CLASS_PREFIX + this.theme)], DomElementUtility.ADD_ACTION, [], null);
        }
    }

    getListedElementsChildNodes(node) {
        let requestedChildNodes = [];
        let listElements = node.children;
        let allSelectedIds = this.trackMultiSelectedOptionsIds.join(', ');
        for (var listElement in listElements) {
            if (listElements[listElement] && listElements[listElement].children && listElements[listElement].children.length > 0) {
                let divElements = new Array((listElements[listElement].children)[0]);
                for (var divElement in divElements) {
                    var lastElement = divElements[divElement];
                    requestedChildNodes.push(lastElement);
                }
            }
        }
        return requestedChildNodes;
    }

    updatePropertiesOfElementsSpecified(elements, classes, action, attributes, attributeValue) {
        elements.forEach(element => {
            classes.forEach(className => {
                DomElementUtility.addOrRemoveClassFromANode(element, className, action);
            })
        })
        elements.forEach(element => {
            attributes.forEach(attributeName => {
                DomElementUtility.setAttributeToANode(element, attributeName, attributeValue);
            })
        })
    }

    @api getSelectedValues(){
        let selectedValues = [];
        if(this.multiSelectedOptions){
            this.multiSelectedOptions.forEach(item => {
                selectedValues.push(item.value);
            })
            return selectedValues;
        } else if(this.singleSelectedOption){
            selectedValues.push(this.singleSelectedOption);
        }
        return selectedValues;
    }
}