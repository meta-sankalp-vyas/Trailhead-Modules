import { LightningElement } from 'lwc';

export default class DomElementUtility extends LightningElement 
{
    static ADD_ACTION = 'ADD';
    static REMOVE_ACTION = 'REMOVE';

    static addOrRemoveClassFromANode(node, className, action)
    {
        if(node && node.classList && node.classList.length > 0)
        {
            if(action && action === this.ADD_ACTION)
            {
                node.classList.add(className);
            }
            else if(action && action === this.REMOVE_ACTION)
            {
                node.classList.remove(className);
            }
        }
    }

    static setAttributeToANode(node, attributeName, value)
    {
        if(node)
        {
            if(attributeName)
            {
                node.setAttribute(attributeName, value);
            }
        }
    }
}